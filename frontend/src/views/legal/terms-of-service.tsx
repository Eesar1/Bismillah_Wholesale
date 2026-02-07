import Wrapper from "@/components/wrapper";

const TermsOfService = () => {
  return (
    <section className="py-20 sm:py-24 bg-black min-h-screen">
      <Wrapper>
        <div className="max-w-4xl mx-auto text-white/80 space-y-8">
          <header className="space-y-2">
            <p className="text-gold text-xs uppercase tracking-[0.2em]">Legal</p>
            <h1 className="text-3xl sm:text-4xl text-white font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>
              Terms of Service
            </h1>
            <p className="text-white/60 text-sm">Last updated: February 7, 2026</p>
          </header>

          <div className="space-y-6 text-sm sm:text-base leading-relaxed">
            <p>
              These Terms of Service govern your use of the Bismillah Wholesale website and services. By using our
              website, you agree to these terms.
            </p>

            <div className="space-y-2">
              <h2 className="text-white text-lg font-semibold">Use of the website</h2>
              <ul className="list-disc list-inside space-y-1 text-white/70">
                <li>Provide accurate information when submitting forms or placing orders.</li>
                <li>Do not misuse the website or attempt unauthorized access.</li>
                <li>Content is for informational and wholesale purchasing purposes only.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-white text-lg font-semibold">Orders and payment</h2>
              <p className="text-white/70">
                Orders are subject to confirmation and availability. Pricing and minimum order quantities may change
                without notice. Payment methods may vary depending on availability and location.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-white text-lg font-semibold">Cancellations and refunds</h2>
              <p className="text-white/70">
                Please contact us immediately for any cancellation requests. Refunds and returns are handled on a
                case-by-case basis depending on the order status and product type.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-white text-lg font-semibold">Limitation of liability</h2>
              <p className="text-white/70">
                We are not liable for indirect or incidental damages arising from the use of our website or services.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-white text-lg font-semibold">Changes to these terms</h2>
              <p className="text-white/70">
                We may update these terms from time to time. Continued use of the website means you accept any changes.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-white text-lg font-semibold">Contact</h2>
              <p className="text-white/70">
                For questions about these terms, email us at{" "}
                <span className="text-gold">info@bismillahwholesale.com</span>.
              </p>
            </div>
          </div>
        </div>
      </Wrapper>
    </section>
  );
};

export default TermsOfService;
