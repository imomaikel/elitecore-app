import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import { cn } from '@/shared/lib/utils';

type TItemWrapper = {
  children: React.ReactNode;
  title: string;
  description?: string | React.ReactNode;
  className?: string;
};
const ItemWrapper = ({ children, title, description, className }: TItemWrapper) => {
  return (
    <div>
      {description ? (
        <Accordion type="single" collapsible className={cn('max-w-[16rem]', className)}>
          <AccordionItem value="item-1" className="border-none">
            <AccordionTrigger>
              <h2 className="font-semibold text-lg">{title}</h2>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{description}</AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : (
        <h2 className="font-semibold text-lg py-4">{title}</h2>
      )}
      {children}
    </div>
  );
};

export default ItemWrapper;
