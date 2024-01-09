import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';

type TItemInfo = {
  children: React.ReactNode;
  title: string;
  description?: string;
};
const ItemInfo = ({ children, title, description }: TItemInfo) => {
  return (
    <div>
      {description ? (
        <Accordion type="single" collapsible className="max-w-[16rem]">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <h2 className="font-semibold text-lg">{title}</h2>
            </AccordionTrigger>
            <AccordionContent>{description}</AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : (
        <h2 className="font-semibold text-lg py-4">{title}</h2>
      )}
      {children}
    </div>
  );
};

export default ItemInfo;
