import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

// Async results
import {
  AsyncResult,
  Success,
  Error,
} from '../../infrastructure/core/results/errors/result';

// Errors
import { EmailFailed } from './static/results/email.errors';

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Sends an email based on the provided options.
   * @returns Boolean of success or email error.
   */
  async sendEmail(
    sendMailOptions: ISendMailOptions,
  ): AsyncResult<boolean, EmailFailed> {
    try {
      await this.mailerService.sendMail(sendMailOptions);
      this.logger.info('Email sent:', { email: sendMailOptions });
      return Success(true);
    } catch (error) {
      this.logger.error('Email error', {
        service: EmailService.name,
        email: sendMailOptions,
        error,
      });
      return Error(EmailFailed());
    }
  }
}
