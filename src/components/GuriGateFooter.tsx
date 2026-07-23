import { Home, Facebook, Instagram, Twitter, Linkedin, Mail } from "lucide-react";

export default function GuriGateFooter() {
  return (
    <footer className="bg-[#2f3131] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#E8344E] to-[#ff6b6b] rounded-full flex items-center justify-center shadow-lg">
                <Home size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold sm:text-2xl">GuriGate</span>
            </div>
            
            <p className="max-w-sm text-sm leading-relaxed text-gray-300 sm:text-justify">
              Are you looking to explore a property at your own convenience? Look no further than GuriGate! As Somali Peninsula's first property company with extensive listings for all regions, we offer the ability to buy, sell, or rent a property easily through our app and website. With GuriGate, your dream property is just a click away!
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="text-[#E8344E] font-semibold text-lg mb-6 tracking-wide">
              Links
            </h3>
            <ul className="space-y-3">
              {["About us", "Terms and Conditions", "Privacy policy", "FAQ", "Contact us"].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-gray-300 hover:text-[#E8344E] transition-colors duration-200 text-sm inline-block hover:translate-x-1 transform"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Connect Section */}
          <div>
            <h3 className="text-[#E8344E] font-semibold text-lg mb-6 tracking-wide">
              Subscribe to our newsletter
            </h3>
            <div className="space-y-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                Stay updated with curated travel guides, exclusive offers, and latest sanctuary destinations delivered to your inbox.
              </p>
              
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full flex-1 px-5 py-3.5 rounded-full bg-[#454747] border border-gray-600 text-white placeholder:text-gray-400 outline-none focus:border-[#E8344E] focus:ring-2 focus:ring-[#E8344E]/20 transition-all"
                />
                <button className="w-full whitespace-nowrap rounded-full bg-[#E8344E] px-6 py-3.5 font-semibold text-white transition-all duration-200 hover:bg-[#d02d44] hover:shadow-lg hover:shadow-[#E8344E]/30 sm:w-auto sm:px-8">
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-3 px-1">
                By subscribing, you agree to our Privacy Policy and Terms of Service.
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-[#E8344E] font-semibold text-lg mb-6 tracking-wide">
                Connect to Social Media
              </h3>
              <div className="mb-8 flex flex-wrap gap-3">
                {[
                  { icon: Facebook, href: "#", label: "Facebook" },
                  { icon: Instagram, href: "#", label: "Instagram" },
                  { icon: Twitter, href: "#", label: "Twitter" },
                  { icon: Linkedin, href: "#", label: "LinkedIn" }
                ].map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-10 h-10 border border-gray-600 rounded-lg flex items-center justify-center hover:bg-[#E8344E] hover:border-[#E8344E] transition-all duration-200 group"
                  >
                    <Icon size={18} className="text-gray-300 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>

              <div>
                <h4 className="text-[#E8344E] font-semibold mb-3 text-sm">
                  Customer Service Email
                </h4>
                <a 
                  href="mailto:customerservice@gurigate.com"
                  className="break-all text-sm text-gray-300 transition-colors duration-200 group flex items-center gap-2 hover:text-[#E8344E] sm:break-normal"
                >
                  <Mail size={16} className="group-hover:scale-110 transition-transform" />
                  customerservice@gurigate.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            Copyright © 2026{" "}
            <span className="text-[#E8344E] font-semibold">GuriGate</span>, All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
