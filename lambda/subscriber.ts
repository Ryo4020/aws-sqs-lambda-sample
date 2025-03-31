import { SQSEvent, SQSHandler } from 'aws-lambda';
import { mainFunc } from './logic/subscriber-func';

export const handler: SQSHandler = async (event: SQSEvent) => {
	const result = mainFunc (event.Records);

    return result;
}