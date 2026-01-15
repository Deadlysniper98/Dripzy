'use client';

import { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Loader2 } from 'lucide-react';

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId.trim()) {
            setError('Please enter your order ID');
            return;
        }
        setLoading(true);
        setError('');

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setError('Order not found. Please check your order ID and try again.');
        }, 1500);
    };

    return (
        <div className="af-legal-page">
            <div className="af-legal-container">
                <h1>Track Your Order</h1>
                <p className="af-legal-updated">Enter your order details to track your shipment</p>

                <section className="af-track-form-section">
                    <form onSubmit={handleSubmit} className="af-track-form">
                        <div className="af-form-group">
                            <label htmlFor="orderId">Order ID</label>
                            <input
                                type="text"
                                id="orderId"
                                placeholder="e.g., DRZ-2026-XXXXX"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                            />
                        </div>
                        <div className="af-form-group">
                            <label htmlFor="email">Email Address (Optional)</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="The email used for your order"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="af-track-btn" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="af-spin" />
                                    Tracking...
                                </>
                            ) : (
                                <>
                                    <Search size={20} />
                                    Track Order
                                </>
                            )}
                        </button>
                        {error && <p className="af-error-message">{error}</p>}
                    </form>
                </section>

                <section>
                    <h2>How Order Tracking Works</h2>
                    <div className="af-tracking-steps">
                        <div className="af-tracking-step">
                            <div className="af-step-icon">
                                <Package size={32} />
                            </div>
                            <h3>Order Confirmed</h3>
                            <p>Your order has been placed and is being processed</p>
                        </div>
                        <div className="af-tracking-step">
                            <div className="af-step-icon">
                                <Package size={32} />
                            </div>
                            <h3>Packed & Shipped</h3>
                            <p>Your order is packed and handed to the courier partner</p>
                        </div>
                        <div className="af-tracking-step">
                            <div className="af-step-icon">
                                <Truck size={32} />
                            </div>
                            <h3>In Transit</h3>
                            <p>Your package is on its way to your delivery address</p>
                        </div>
                        <div className="af-tracking-step">
                            <div className="af-step-icon">
                                <CheckCircle size={32} />
                            </div>
                            <h3>Delivered</h3>
                            <p>Your order has been delivered successfully</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2>Need Help?</h2>
                    <p>If you're having trouble tracking your order or have any questions, please contact us:</p>
                    <p><strong>Email:</strong> support@dripzy.in</p>
                    <p><strong>WhatsApp:</strong> +91 XXXXX XXXXX</p>
                </section>
            </div>
        </div>
    );
}
