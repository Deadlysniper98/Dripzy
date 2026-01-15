import { Zap, Shield, Truck, Headphones } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="af-legal-page af-about-page">
            <div className="af-legal-container">
                <div className="af-about-hero">
                    <h1>About Dripzy.in</h1>
                    <p className="af-about-tagline">Premium Tech Accessories for the Modern Lifestyle</p>
                </div>

                <section className="af-about-story">
                    <h2>Our Story</h2>
                    <p>Founded in 2024, Dripzy.in was born from a simple observation: finding quality tech accessories in India shouldn't be so difficult. We noticed that consumers were often forced to choose between overpriced branded products or unreliable alternatives.</p>
                    <p>We set out to bridge this gap by curating and offering premium-quality tech accessories at fair prices. Every product in our catalog is carefully selected and tested to ensure it meets our high standards for quality, durability, and design.</p>
                </section>

                <section className="af-about-mission">
                    <h2>Our Mission</h2>
                    <p>To make premium tech accessories accessible to everyone, without compromising on quality or breaking the bank. We believe that good design and reliable functionality should be the standard, not the exception.</p>
                </section>

                <section className="af-about-values">
                    <h2>Why Choose Dripzy?</h2>
                    <div className="af-values-grid">
                        <div className="af-value-card">
                            <div className="af-value-icon">
                                <Shield size={40} />
                            </div>
                            <h3>Quality Assured</h3>
                            <p>Every product is quality-tested before listing. We stand behind what we sell.</p>
                        </div>
                        <div className="af-value-card">
                            <div className="af-value-icon">
                                <Zap size={40} />
                            </div>
                            <h3>Latest Tech</h3>
                            <p>We stay updated with the latest technology trends to bring you the newest accessories.</p>
                        </div>
                        <div className="af-value-card">
                            <div className="af-value-icon">
                                <Truck size={40} />
                            </div>
                            <h3>Fast Shipping</h3>
                            <p>Free shipping on prepaid orders with quick delivery across India.</p>
                        </div>
                        <div className="af-value-card">
                            <div className="af-value-icon">
                                <Headphones size={40} />
                            </div>
                            <h3>Customer First</h3>
                            <p>Dedicated support team ready to help with any questions or concerns.</p>
                        </div>
                    </div>
                </section>

                <section className="af-about-numbers">
                    <h2>Dripzy in Numbers</h2>
                    <div className="af-numbers-grid">
                        <div className="af-number-item">
                            <span className="af-number">10K+</span>
                            <span className="af-number-label">Happy Customers</span>
                        </div>
                        <div className="af-number-item">
                            <span className="af-number">500+</span>
                            <span className="af-number-label">Products</span>
                        </div>
                        <div className="af-number-item">
                            <span className="af-number">50+</span>
                            <span className="af-number-label">Cities Served</span>
                        </div>
                        <div className="af-number-item">
                            <span className="af-number">4.8★</span>
                            <span className="af-number-label">Average Rating</span>
                        </div>
                    </div>
                </section>

                <section>
                    <h2>Get in Touch</h2>
                    <p>We'd love to hear from you! Whether you have questions, feedback, or just want to say hello:</p>
                    <p><strong>Email:</strong> hello@dripzy.in</p>
                    <p><strong>Instagram:</strong> @dripzy.in</p>
                    <p><strong>Twitter/X:</strong> @dripzy.in</p>
                </section>
            </div>
        </div>
    );
}
