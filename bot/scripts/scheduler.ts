import { updateServerControlWidget } from '../plugins/server-control';
import updateServerStatusWidget from '../plugins/server-status';

// TODO
const scheduler = () => {
  setInterval(() => {
    updateServerControlWidget();
  }, 1000 * 60 * 3);
  setInterval(() => {
    updateServerStatusWidget();
  }, 1000 * 60 * 5);
};

export default scheduler;
