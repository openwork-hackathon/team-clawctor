import type { FC } from 'react';
import { Header, Footer } from '../components/layout';
import {
  HeroSection,
  FeaturesSection,
  ReportPreviewSection,
  HowItWorksSection,
  CTASection,
} from '../components/landing';

export const LandingPage: FC = () => {
  const handleLoginClick = () => {
    console.log('Login clicked');
  };

  const handleStartTrialClick = () => {
    console.log('Start trial clicked');
    // TODO: Navigate to signup/trial page
  };

  const handleStartAuditClick = () => {
    console.log('Start audit clicked');
    // TODO: Navigate to audit start flow
  };

  const handleBookDemoClick = () => {
    console.log('Book demo clicked');
    // TODO: Open demo booking modal or navigate
  };

  const handleGetStartedClick = () => {
    console.log('Get started clicked');
    // TODO: Navigate to signup page
  };

  const handleContactSalesClick = () => {
    console.log('Contact sales clicked');
    // TODO: Open contact form or navigate
  };

  return (
    <>
      <Header
        onLoginClick={handleLoginClick}
        onStartTrialClick={handleStartTrialClick}
      />
      <main className="pt-24">
        <HeroSection
          onStartAuditClick={handleStartAuditClick}
          onBookDemoClick={handleBookDemoClick}
        />
        <FeaturesSection />
        <ReportPreviewSection />
        <HowItWorksSection />
        <CTASection
          onGetStartedClick={handleGetStartedClick}
          onContactSalesClick={handleContactSalesClick}
        />
      </main>
      <Footer />
    </>
  );
};

export default LandingPage;
