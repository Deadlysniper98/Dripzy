import { Briefcase, MapPin, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CareersPage() {
    const openPositions = [
        {
            title: 'Product Manager',
            department: 'Product',
            location: 'Remote / Bangalore',
            type: 'Full-time',
        },
        {
            title: 'Frontend Developer',
            department: 'Engineering',
            location: 'Remote',
            type: 'Full-time',
        },
        {
            title: 'Customer Success Executive',
            department: 'Support',
            location: 'Bangalore',
            type: 'Full-time',
        },
        {
            title: 'Social Media Manager',
            department: 'Marketing',
            location: 'Remote',
            type: 'Full-time',
        },
    ];

    return (
        <div className="af-legal-page af-careers-page">
            <div className="af-legal-container">
                <div className="af-careers-hero">
                    <h1>Join the Dripzy Team</h1>
                    <p className="af-careers-tagline">Help us build the future of tech accessories in India</p>
                </div>

                <section className="af-careers-intro">
                    <h2>Why Work With Us?</h2>
                    <p>At Dripzy, we're not just selling products – we're building a brand that people love and trust. We're a small but growing team of passionate individuals who believe in quality, customer experience, and making tech accessible to everyone.</p>

                    <div className="af-perks-grid">
                        <div className="af-perk-item">
                            <h3>🏠 Remote-First</h3>
                            <p>Work from anywhere in India. We believe in flexibility and trust.</p>
                        </div>
                        <div className="af-perk-item">
                            <h3>📈 Growth Opportunity</h3>
                            <p>Be part of a fast-growing startup with real impact.</p>
                        </div>
                        <div className="af-perk-item">
                            <h3>💰 Competitive Pay</h3>
                            <p>Fair compensation with performance bonuses.</p>
                        </div>
                        <div className="af-perk-item">
                            <h3>🎁 Product Discounts</h3>
                            <p>Exclusive discounts on all Dripzy products.</p>
                        </div>
                    </div>
                </section>

                <section className="af-open-positions">
                    <h2>Open Positions</h2>
                    <div className="af-positions-list">
                        {openPositions.map((job, index) => (
                            <div key={index} className="af-position-card">
                                <div className="af-position-info">
                                    <h3>{job.title}</h3>
                                    <div className="af-position-meta">
                                        <span><Briefcase size={16} /> {job.department}</span>
                                        <span><MapPin size={16} /> {job.location}</span>
                                        <span><Clock size={16} /> {job.type}</span>
                                    </div>
                                </div>
                                <a href={`mailto:careers@dripzy.in?subject=Application for ${job.title}`} className="af-apply-btn">
                                    Apply <ArrowRight size={16} />
                                </a>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="af-no-position">
                    <h2>Don't See Your Role?</h2>
                    <p>We're always looking for talented individuals. If you think you'd be a great fit for Dripzy, send us your resume and tell us why you'd like to join our team.</p>
                    <a href="mailto:careers@dripzy.in" className="af-general-apply">
                        Send General Application
                    </a>
                </section>

                <section>
                    <h2>Contact HR</h2>
                    <p><strong>Email:</strong> careers@dripzy.in</p>
                    <p><strong>LinkedIn:</strong> Dripzy Technologies</p>
                </section>
            </div>
        </div>
    );
}
