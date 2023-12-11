import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <div className="z-10 min-h-[35px] bg-secondary flex items-center flex-col md:flex-row justify-between text-[11px] font-normal px-4 md:px-8 py-1 md:py-0 text-[#B2B2B2] arial">
      {/* Logo and text */}
      <div className="flex items-center h-full">
        <Image src="/tebex.png" width={54} height={28} alt="tebex" className="hidden md:block" />
        <div className="ml:0 md:ml-[32px] pr-8 md:pr-0 h-full items-center flex flex-wrap mt-[1px] md:mt-0">
          All credit card purchases are handled by Tebex, who handle product fulfillment, billing, support, and refunds
          for all such transactions.
        </div>
      </div>
      {/* Links */}
      <div className="underline h-full flex items-center pt-[2px]">
        <Link href="https://checkout.tebex.io/impressum" className="mr-[14px]">
          Impressum
        </Link>
        <Link href="https://checkout.tebex.io/terms" className="mr-[14px]">
          Terms &amp; Conditions
        </Link>
        <Link href="https://checkout.tebex.io/privacy" className="mr-[14px]">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
};

export default Footer;
