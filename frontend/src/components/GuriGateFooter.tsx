import { Home, Facebook, Twitter, Linkedin, Mail } from "lucide-react";

export default function GuriGateFooter() {
  return (
    <footer className="bg-[#1a1c1c] text-white">
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
                  { icon: null, href: "#", label: "Instagram" },
                  { icon: Twitter, href: "#", label: "Twitter" },
                  { icon: Linkedin, href: "#", label: "LinkedIn" }
                ].map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-10 h-10 border border-gray-600 rounded-lg flex items-center justify-center hover:bg-[#E8344E] hover:border-[#E8344E] transition-all duration-200 group"
                  >
                    {label === "Instagram" ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" className="text-gray-300 group-hover:text-white transition-colors" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.43.403a4.088 4.088 0 0 1 1.518.987 4.088 4.088 0 0 1 .987 1.518c.163.46.349 1.26.403 2.43.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.403 2.43a4.088 4.088 0 0 1-.987 1.518 4.088 4.088 0 0 1-1.518.987c-.46.163-1.26.349-2.43.403-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.43-.403a4.088 4.088 0 0 1-1.518-.987 4.088 4.088 0 0 1-.987-1.518c-.163-.46-.349-1.26-.403-2.43C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.054-1.17.24-1.97.403-2.43a4.088 4.088 0 0 1 .987-1.518A4.088 4.088 0 0 1 5.14 2.233c.46-.163 1.26-.349 2.43-.403C8.836 2.175 9.216 2.163 12 2.163M12 0C8.741 0 8.333.014 7.053.072 5.775.13 4.902.333 4.14.63a6.21 6.21 0 0 0-2.245 1.462A6.21 6.21 0 0 0 .433 4.337C.136 5.1-.067 5.973.01 7.25.068 8.53.082 8.938.082 12.197c0 3.259.014 3.667.072 4.947.058 1.277.261 2.15.558 2.913a6.21 6.21 0 0 0 1.462 2.245 6.21 6.21 0 0 0 2.245 1.462c.763.297 1.636.5 2.913.558C8.53 24.38 8.938 24.394 12 24.394s3.47-.014 4.75-.072c1.277-.058 2.15-.261 2.913-.558a6.21 6.21 0 0 0 2.245-1.462 6.21 6.21 0 0 0 1.462-2.245c.297-.763.5-1.636.558-2.913.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.058-1.277-.261-2.15-.558-2.913a6.21 6.21 0 0 0-1.462-2.245A6.21 6.21 0 0 0 19.663.433C18.9.136 18.027-.067 16.75.01 15.47.068 15.062.082 12 .082V0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/>
                      </svg>
                    ) : (
                      Icon && <Icon size={18} fill="currentColor" strokeWidth={0} className="text-gray-300 group-hover:text-white transition-colors" />
                    )}
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
