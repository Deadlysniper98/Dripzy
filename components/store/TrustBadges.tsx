import { Truck, ShieldCheck, CheckCircle, RotateCcw } from 'lucide-react';

export const TrustBadges = () => {
    return (
        <div className="af-trust-wrapper">
            <div className="af-trust-container">
                <div className="af-trust-grid">
                    <div className="af-trust-item">
                        <div className="af-trust-icon"><Truck /></div>
                        <div className="af-trust-content"><h4>Free Shipping</h4><p>On orders above ₹999.</p></div>
                    </div>
                    <div className="af-trust-item">
                        <div className="af-trust-icon"><ShieldCheck /></div>
                        <div className="af-trust-content"><h4>Secure Checkout</h4><p>Encrypted transactions.</p></div>
                    </div>
                    <div className="af-trust-item">
                        <div className="af-trust-icon"><CheckCircle /></div>
                        <div className="af-trust-content"><h4>Standard Warranty</h4><p>1-year coverage.</p></div>
                    </div>
                    <div className="af-trust-item">
                        <div className="af-trust-icon"><RotateCcw /></div>
                        <div className="af-trust-content"><h4>Easy Returns</h4><p>7-day policy.</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
