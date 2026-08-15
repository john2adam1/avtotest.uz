"use client"

import { useEffect, useState } from "react"
import { Download, X, Smartphone } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showBanner, setShowBanner] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)
    const [isInstalling, setIsInstalling] = useState(false)

    useEffect(() => {
        // Check if already installed as PWA
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsInstalled(true)
            return
        }

        // Check if user dismissed previously (24h cooldown)
        const dismissed = localStorage.getItem("pwa-install-dismissed")
        if (dismissed) {
            const dismissedAt = parseInt(dismissed, 10)
            if (Date.now() - dismissedAt < 24 * 60 * 60 * 1000) return
        }

        const handler = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            // Show banner after a short delay so user can see the page first
            setTimeout(() => setShowBanner(true), 2000)
        }

        window.addEventListener("beforeinstallprompt", handler)

        return () => window.removeEventListener("beforeinstallprompt", handler)
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return
        setIsInstalling(true)
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === "accepted") {
            setIsInstalled(true)
            setShowBanner(false)
        }
        setDeferredPrompt(null)
        setIsInstalling(false)
    }

    const handleDismiss = () => {
        setShowBanner(false)
        localStorage.setItem("pwa-install-dismissed", Date.now().toString())
    }

    if (isInstalled || !showBanner) return null

    return (
        <div
            className="pwa-install-banner"
            role="dialog"
            aria-label="Ilovani yuklab olish"
        >
            {/* Dismiss button */}
            <button
                onClick={handleDismiss}
                className="pwa-dismiss-btn"
                aria-label="Yopish"
            >
                <X size={16} />
            </button>

            {/* Icon */}
            <div className="pwa-icon">
                <Smartphone size={28} />
            </div>

            {/* Text */}
            <div className="pwa-text">
                <p className="pwa-title">Ilovani yuklab oling</p>
                <p className="pwa-subtitle">
                    Sarvar Avto Testni telefonga o'rnatib, internetsizsiz ham foydalaning!
                </p>
            </div>

            {/* Install button */}
            <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="pwa-install-btn"
            >
                {isInstalling ? (
                    <span className="pwa-spinner" />
                ) : (
                    <Download size={16} />
                )}
                {isInstalling ? "O'rnatilmoqda..." : "Yuklab olish"}
            </button>

            <style>{`
        .pwa-install-banner {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(30, 27, 75, 0.98) 100%);
          border: 1px solid rgba(99, 102, 241, 0.4);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.05);
          backdrop-filter: blur(20px);
          width: calc(100vw - 32px);
          max-width: 480px;
          animation: pwa-slide-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes pwa-slide-up {
          from { opacity: 0; transform: translateX(-50%) translateY(80px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .pwa-dismiss-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          flex-shrink: 0;
        }
        .pwa-dismiss-btn:hover {
          background: rgba(255,255,255,0.2);
          color: #fff;
        }

        .pwa-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }

        .pwa-text {
          flex: 1;
          min-width: 0;
        }
        .pwa-title {
          font-weight: 700;
          font-size: 14px;
          color: #f1f5f9;
          margin: 0 0 3px 0;
          line-height: 1.2;
        }
        .pwa-subtitle {
          font-size: 12px;
          color: rgba(148, 163, 184, 0.9);
          margin: 0;
          line-height: 1.4;
        }

        .pwa-install-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          transition: opacity 0.2s, transform 0.2s;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }
        .pwa-install-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .pwa-install-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .pwa-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: pwa-spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes pwa-spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 400px) {
          .pwa-install-banner {
            flex-wrap: wrap;
            justify-content: space-between;
          }
          .pwa-install-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
        </div>
    )
}
