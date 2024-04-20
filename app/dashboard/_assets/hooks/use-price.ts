import { useCurrentUser } from './use-current-user';
import { useTebex } from './use-tebex';

const WEBSTORE_IDENTIFIER = process.env.NEXT_PUBLIC_TEBEX_WEBSTORE_IDENTIFIER;
const BASE_URL = process.env.NEXT_PUBLIC_TEBEX_BASE_URL;

export const usePrice = () => {
  const { basket, _updatePrice, setBasket } = useTebex();
  const { user } = useCurrentUser();

  const updatePrice = (forceUpdate?: boolean) => {
    if (!user?.basketIdent) {
      _updatePrice();
      return;
    }

    let hasGiftcards = false;
    if (basket?.giftcards) {
      if (basket.giftcards?.length >= 1) {
        hasGiftcards = true;
      }
    }

    if (hasGiftcards || forceUpdate) {
      const url = `${BASE_URL}/api/accounts/${WEBSTORE_IDENTIFIER}/baskets/${user.basketIdent}`;
      fetch(url, { method: 'GET' })
        .then((res) => res.json())
        .then((response) => {
          setBasket(response.data);
        });
    } else {
      _updatePrice();
    }
  };

  return {
    updatePrice,
  };
};
