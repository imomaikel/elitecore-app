import { format } from 'date-fns';
import chalk from 'chalk';

// Logger props
type TLogger = {
  type: 'error' | 'info';
  message: string;
  file?: string;
  data?: string;
};

// Create formatted timestamp
const generateDate = () => {
  const formattedTimestamp = format(new Date(), 'dd/LL HH:mm').toString();
  const coloredTimestamp = chalk.bgGray(`[ ${formattedTimestamp} ]`);
  return coloredTimestamp;
};

/**
 * Create a new custom-style log in the console
 */
const logger = ({ type, message, file, data }: TLogger) => {
  const timestamp = generateDate();
  const logType = type === 'info' ? chalk.greenBright(type.toUpperCase()) : chalk.redBright(type.toUpperCase());
  const fileName = file ? `(${file})` : '';
  const log = `${timestamp} ${logType}${fileName} : ${message}`;
  console.log(log);
  if (data) console.log(data);
};

export default logger;
