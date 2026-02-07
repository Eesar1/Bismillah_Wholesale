import Wrapper from "@/components/wrapper";

const PrivacyPolicy = () => {
  return (
    <section className="py-20 sm:py-24 bg-black min-h-screen">
      <Wrapper>
        <div className="max-w-4xl mx-auto text-white/80 space-y-8">
          <header className="space-y-2">
            <p className="text-gold text-xs uppercase tracking-[0.2em]">Legal</p>
            <h1 className="text-3xl sm:text-4xl text-white font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>
              Privacy Policy
            </h1>
            <p className="text-white/60 text-sm">Last updated: February 7, 2026</p>
          </header>

          <div className="space-y-6 text-sm sm:text-base leading-relaxed">
            <p>
              This Privacy Policy explains how Bismillah Wholesale ("we", "us", "our") collects, uses, and protects
              your information when you visit our website or contact us.
            </p>

            <div className="space-y-2">
              <h2 className="text-white text-lg font-semibold">Information we collect</h2>
              <ul className="list-disc list-inside space-y-1 text-white/70">
                <li>Contact details (name, email, phone) submitted through forms.</li>
                <li>Order and delivery information when you place an order.</li>
                <li>Usage data such as pages viewed and interactions (via analytics tools).</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-white text-lg font-semibold">How we use your information</h2>
              <ul className="list-disc list-inside space-y-1 text-white/70">
                <li>To respond to inquiries and provide customer support.</li>
                <li>To process and fulfill orders, including delivery updates.</li>
                <li>To improve our website and customer experience.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-white text-lg font-semibold">Sharing of information</h2>
              <p className="text-white/70">
                We do not sell your personal data. We may share information with service providers (e.g., email,
                hosting, delivery) only as needed to operate our services.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-white text-lg font-semibold">Data security</h2>
              <p className="text-white/70">
                We take reasonable steps to protect your data. However, no method of transmission over the internet is
                100% secure.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-white text-lg font-semibold">Your rights</h2>
              <p className="text-white/70">
                You may request access, correction, or deletion of your personal information by contacting us.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-white text-lg font-semibold">Contact</h2>
              <p className="text-white/70">
                If you have questions about this policy, email us at{" "}
                <span className="text-gold">info@bismillahwholesale.com</span>.
              </p>
            </div>
          </div>
        </div>
      </Wrapper>
    </section>
  );
};

export default PrivacyPolicy;
