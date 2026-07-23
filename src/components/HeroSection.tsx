import React from 'react'

const HeroSection: React.FC = () => {
  return (
    <div data-layer="Container" className="Container w-[1440px] h-[610px] inline-flex flex-col justify-start items-center gap-12">
      <div data-layer="Frame 2147207706" className="Frame2147207706 w-[1280px] flex flex-col justify-start items-start gap-20">
        <img data-layer="image 13" className="Image13 w-[1280px] h-72 rounded-[32px] shadow-[0px_16px_32px_-2px_rgba(0,0,0,0.14)]" src="https://placehold.co/1280x291" alt="" />
        <div data-layer="Frame 2147207697" className="Frame2147207697 self-stretch inline-flex justify-start items-start gap-28">
          <div data-layer="Title + Buttons" className="TitleButtons size- inline-flex flex-col justify-start items-center gap-6">
            <div data-layer="Title" className="Title size- flex flex-col justify-start items-center gap-3">
              <div data-layer="Manage All your Finance in One Place" className="ManageAllYourFinanceInOnePlace justify-start text-indigo-950 text-7xl font-medium font-['Lufga'] leading-[80px]">Manage All your<br/>Finance in One <br/>Place</div>
            </div>
          </div>
          <div data-layer="Frame 2147207696" className="Frame2147207696 w-[616px] inline-flex flex-col justify-start items-center gap-16">
            <div data-layer="Bank smarter with Wadaag Mobile Banking. Access your accounts, transfer money, pay bills, monitor transactions, and manage your finances securely from anywhere, at any time." className="BankSmarterWithWadaagMobileBankingAccessYourAccountsTransferMoneyPayBillsMonitorTransactionsAndManageYourFinancesSecurelyFromAnywhereAtAnyTime self-stretch opacity-50 text-center justify-start text-neutral-800 text-xl font-normal font-['DM_Sans'] leading-8">Bank smarter with Wadaag Mobile Banking. Access your accounts, transfer money, pay bills, monitor transactions, and manage your finances securely from anywhere, at any time.</div>
            <div data-layer="Buttons" className="Buttons size- inline-flex justify-start items-start gap-2">
              <div data-layer="Button" className="Button h-14 px-10 py-2 bg-amber-200 rounded-[50px] flex justify-center items-center gap-3">
                <div data-layer="Download the App Today" className="DownloadTheAppToday justify-start text-neutral-800 text-base font-bold font-['DM_Sans'] leading-6">Download the App Today</div>
                <div data-svg-wrapper data-layer="Arrow Icon" className="ArrowIcon relative">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_31319_8018)">
                      <path d="M15.9952 12.7952L16 0L3.19999 0.0015793L3.19841 1.60002H13.2688L0 14.8688L1.1312 16L14.4 2.73122V12.8L15.9952 12.7952Z" fill="#222222"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_31319_8018">
                        <rect width="16" height="16" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              </div>
              <div data-layer="Button 2" data-property-1="Ver 2" className="Button2 h-14 px-10 py-2 rounded-[50px] outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-center items-center">
                <div data-layer="Learn More" className="LearnMore justify-start text-neutral-800 text-base font-bold font-['DM_Sans'] leading-6">Share</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection
