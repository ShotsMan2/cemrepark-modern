"use client";

import { useState } from "react";
import { CreditCard, Building2, CheckCircle2 } from "lucide-react";

export type PaymentMethod = "credit_card" | "bank_transfer";

interface PaymentSelectorProps {
  selectedMethod: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

export default function PaymentSelector({ selectedMethod, onSelect }: PaymentSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* Credit Card Option */}
      <div
        className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 overflow-hidden group ${
          selectedMethod === "credit_card"
            ? "border-primary bg-primary/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.02)]"
            : "border-glass-border hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-white/5"
        }`}
        onClick={() => onSelect("credit_card")}
      >
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className={`p-3 rounded-xl transition-colors duration-300 ${
              selectedMethod === "credit_card" ? "bg-primary text-foreground" : "bg-gray-100 dark:bg-white/10 text-foreground/60 group-hover:text-primary"
            }`}>
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className={`font-bold text-lg transition-colors duration-300 ${
                selectedMethod === "credit_card" ? "text-primary" : "text-foreground"
              }`}>Kredi / Banka Kartı</h4>
              <p className="text-sm text-foreground/60 mt-1">Iyzico / Stripe Güvencesiyle</p>
            </div>
          </div>
          <div className={`transition-all duration-300 ${
            selectedMethod === "credit_card" ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}>
            <CheckCircle2 className="w-6 h-6 text-primary" />
          </div>
        </div>
        
        {/* Animated Background Gradient for Selected State */}
        <div className={`absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 ${
          selectedMethod === "credit_card" ? "opacity-100" : ""
        }`} />
      </div>

      {/* Bank Transfer Option */}
      <div
        className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 overflow-hidden group ${
          selectedMethod === "bank_transfer"
            ? "border-secondary bg-secondary/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.02)]"
            : "border-glass-border hover:border-secondary/50 hover:bg-gray-50 dark:hover:bg-white/5"
        }`}
        onClick={() => onSelect("bank_transfer")}
      >
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className={`p-3 rounded-xl transition-colors duration-300 ${
              selectedMethod === "bank_transfer" ? "bg-secondary text-black" : "bg-gray-100 dark:bg-white/10 text-foreground/60 group-hover:text-secondary"
            }`}>
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className={`font-bold text-lg transition-colors duration-300 ${
                selectedMethod === "bank_transfer" ? "text-secondary" : "text-foreground"
              }`}>Havale / EFT</h4>
              <p className="text-sm text-foreground/60 mt-1">%5 İndirim Fırsatıyla</p>
            </div>
          </div>
          <div className={`transition-all duration-300 ${
            selectedMethod === "bank_transfer" ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}>
            <CheckCircle2 className="w-6 h-6 text-secondary" />
          </div>
        </div>

        {/* Animated Background Gradient for Selected State */}
        <div className={`absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 ${
          selectedMethod === "bank_transfer" ? "opacity-100" : ""
        }`} />
      </div>
    </div>
  );
}
