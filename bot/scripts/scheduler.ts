import { updateServerControlWidget } from '../plugins/server-control';
import updateServerStatusWidget from '../plugins/server-status';

const scheduler = () => {
  setInterval(() => {
    updateServerControlWidget();
  }, 1000 * 60 * 3);
  updateServerControlWidget();

  setInterval(() => {
    updateServerStatusWidget();
  }, 1000 * 60 * 5);
  updateServerStatusWidget();
};

export default scheduler;
