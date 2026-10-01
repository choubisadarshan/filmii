"use client";

import { useCart } from "@/context/CartContext";
import { useSound } from "@/components/fx/SoundProvider";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Calendar, ShoppingBag, ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateDays,
    totalEstimate,
    clearCart,
  } = useCart();

  const { playHoverSound, playShutterSound } = useSound();
  const [submitted, setSubmitted] = useState(false);

  const handleCheckout = () => {
    playShutterSound();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsCartOpen(false);
      // Scroll to contact form smoothly
      const contactSection = document.getElementById("contact");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            style={{ willChange: "opacity" }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[80]"
          />

          {/* Drawer Slide-Over Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001 }}
            style={{ transformPerspective: 1000, willChange: "transform, opacity" }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-neutral-950 border-l border-neutral-800 z-[90] flex flex-col justify-between p-6 shadow-[0_0_50px_rgba(255,0,0,0.3)]"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600/10 rounded-lg border border-red-600/30 text-red-500">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-2xl tracking-wider text-white uppercase">
                    GEAR <span className="text-red-600">RENTAL CART</span>
                  </h3>
                  <p className="text-xs font-mono text-neutral-400">
                    {cart.length} PACKAGE ITEM{cart.length !== 1 ? "S" : ""} SELECTED
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  playHoverSound();
                  setIsCartOpen(false);
                }}
                aria-label="Close cart drawer"
                className="p-2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-red-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-neutral-400">
                  <ShoppingBag className="w-12 h-12 text-neutral-600" />
                  <p className="font-mono text-sm uppercase">Your rental list is empty</p>
                  <p className="text-xs text-neutral-400 max-w-xs">
                    Browse our Equipment section to select cinema cameras, anamorphic lenses, lighting, and audio gear.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ type: "spring", stiffness: 90, damping: 25, mass: 0.8, restDelta: 0.001 }}
                    style={{ transformPerspective: 1000, willChange: "transform, opacity" }}
                    className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-red-600/50 transition-all flex gap-4"
                  >
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-neutral-950 flex-shrink-0 border border-neutral-800">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest block font-semibold">
                            {item.category}
                          </span>
                          <h4 className="font-semibold text-white text-sm leading-snug">
                            {item.name}
                          </h4>
                        </div>
                        <button
                          onClick={() => {
                            playHoverSound();
                            removeFromCart(item.id);
                          }}
                          aria-label={`Remove ${item.name} from rental cart`}
                          className="text-neutral-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex justify-between items-end mt-2">
                        {/* Days Counter */}
                        <div className="flex items-center gap-1.5 text-xs font-mono bg-neutral-950 px-2 py-1 rounded border border-neutral-800">
                          <Calendar className="w-3 h-3 text-red-500" />
                          <span className="text-neutral-300">DAYS:</span>
                          <input
                            type="number"
                            min="1"
                            max="30"
                            aria-label={`Rental days for ${item.name}`}
                            value={item.days}
                            onChange={(e) =>
                              updateDays(item.id, parseInt(e.target.value) || 1)
                            }
                            className="w-8 bg-transparent text-center font-bold text-white outline-none"
                          />
                        </div>

                        {/* Price Calculation */}
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-neutral-500 block">
                            ${item.dailyRate}/DAY
                          </span>
                          <span className="font-bold text-red-500 font-mono text-sm">
                            ${item.dailyRate * item.days * item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer Calculation & Checkout */}
            {cart.length > 0 && (
              <div className="border-t border-neutral-800 pt-4 space-y-4">
                <div className="space-y-1 font-mono">
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>ESTIMATED DAILY RATE:</span>
                    <span>${cart.reduce((a, b) => a + b.dailyRate * b.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-neutral-900">
                    <span>ESTIMATED TOTAL:</span>
                    <span className="text-red-500 text-xl">${totalEstimate}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      playHoverSound();
                      clearCart();
                    }}
                    className="py-3 px-4 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 font-mono text-xs uppercase tracking-wider transition-colors"
                  >
                    CLEAR LIST
                  </button>

                  <button
                    onClick={handleCheckout}
                    disabled={submitted}
                    className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,0,0,0.5)] transition-all"
                  >
                    {submitted ? (
                      <>
                        <Check className="w-4 h-4 text-white animate-bounce" />
                        ADDED TO QUOTE
                      </>
                    ) : (
                      <>
                        CONFIRM QUOTE
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
