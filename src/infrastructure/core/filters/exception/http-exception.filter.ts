import { Injectable, HttpException, ArgumentsHost } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Request } from 'express';
import { snakeCase } from 'snake-case';

type HttpArgumentsHost = ReturnType<ArgumentsHost['switchToHttp']>;

// Services
import { TranslationService } from '../../../i18n/translation.service';

// Contracts
import {
  FieldError,
  HttpExceptionData,
  SingleLevelErrors,
  TContext,
  TContexts,
} from './contracts/exception.contracts';

// Utils
import { isEmpty, capitalizeString } from '../../../../common/utils';

@Injectable()
export class HttpExceptionFilter {
  constructor(private translationService: TranslationService) {}

  /**
   * Handles HTTP Exception thrown by the application.
   * @param exception - HTTP Exception.
   * @param host - Provides access to parameters passed to handler.
   */
  async handleHttpException(
    exception: HttpException,
    host: HttpArgumentsHost,
  ): Promise<HttpExceptionData> {
    // Retrieve request for response localization.
    const request = host.getRequest<Request & { i18nLang: string }>();
    const lang = request.i18nLang;

    const statusCode = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();

    const httpExceptionData: HttpExceptionData = {
      statusCode: statusCode,
      timestamp: new Date(),
    };

    await this.formatError(httpExceptionData, exceptionResponse, lang);

    return httpExceptionData;
  }

  /**
   * Formats error messages for the response.
   * @param httpExceptionData - Exception response payload.
   * @param exceptionResponse - Application's exception response.
   * @param lang - Localization string.
   */
  private async formatError(
    httpExceptionData: HttpExceptionData,
    exceptionResponse: any,
    lang: string,
  ): Promise<void> {
    if (isEmpty(exceptionResponse)) return;

    // These are usually our custom made errors.
    if (typeof exceptionResponse.code == 'string') {
      httpExceptionData.errorCode = exceptionResponse.code;
      httpExceptionData.details = exceptionResponse.details;
      httpExceptionData.errorMessage =
        this.translationService.getExceptionMessage(exceptionResponse, lang);
      return;
    }

    // These are usually domain thrown exceptions.
    if (typeof exceptionResponse.message == 'string') {
      httpExceptionData.errorMessage = this.translationService.getMessage(
        exceptionResponse.message,
        lang,
      );
      return;
    }

    // These are usually validation errors.
    if (Array.isArray(exceptionResponse.message)) {
      // Formatting errors in single level manner. Cane be switched to nested errors.
      const errors = await this.formatSingleLevelErrors(
        exceptionResponse.message,
        lang,
      );
      httpExceptionData.errors = this.buildFieldErrors(errors);
      httpExceptionData.errorMessage = this.getFirstErrorMessage(errors);
      httpExceptionData.targetDto = this.getTargetDto(exceptionResponse);
    }
  }

  /**
   * Returns first validation error message.
   * @param errors - Formatted validation errors.
   * @returns First validation error message.
   */
  private getFirstErrorMessage(errors: Record<string, any>): string {
    const keys = Object.keys(errors);
    const error = errors[keys[0]];
    if (typeof error === 'string') {
      return error;
    }
    if (typeof error === 'object') {
      return this.getFirstErrorMessage(error);
    }
    return 'Request failed.';
  }

  /**
   * Formats validation errors in a nested DTO manner.
   * Nested errors indicate that some error keys can be nested error objects.
   * Example:
   * {
   *   "errors": {
   *      "account": {
   *         "name": "Name should not be empty.",
   *         "location": {
   *             "longitude": "Longitude should not be empty."
   *         }
   *      },
   *   }
   * }
   * @param validations - Validation errors.
   * @param lang - Language to translate to.
   * @returns - Validation errors nested object.
   */
  private async formatNestedErrors(
    validations: ValidationError[],
    lang: string,
  ): Promise<Record<string, any>> {
    const errors: Record<string, any> = {};
    await Promise.all(
      validations.map(async (validation: ValidationError) => {
        if (validation.children && validation.children.length > 0) {
          errors[snakeCase(validation.property)] =
            await this.formatNestedErrors(validation.children, lang);
        } else {
          errors[snakeCase(validation.property)] = await this.getErrorMessage(
            validation,
            lang,
          );
        }
      }),
    );
    return errors;
  }

  /**
   * Formats validation errors in a single level manner.
   * Single level errors indicate that every error key is an error message string.
   * Example:
   * {
   *   "errors": {
   *      "account.name": "Name should not be empty.",
   *      "account.location.longitude": "Longitude should not be empty"
   *   }
   * }
   * @param validationErrors - Validation errors.
   * @param lang - Language to translate to.
   * @returns - Validation errors nested object.
   */
  private async formatSingleLevelErrors(
    validationErrors: ValidationError[],
    lang: string,
  ): Promise<SingleLevelErrors> {
    const formattedErrors: SingleLevelErrors = {};
    await Promise.all(
      validationErrors.map(async (validationError: ValidationError) =>
        this.extractSingleLevelError(
          formattedErrors,
          validationError,
          snakeCase(validationError.property),
          lang,
        ),
      ),
    );
    return formattedErrors;
  }

  /**
   * Recursively extracts a single level error message from the given validation error.
   * @param formattedErrors - Errors object.
   * @param validationError - Validation error.
   * @param baseErrorPath - Path to error message.
   * @param lang - Language to translate to.
   */
  private async extractSingleLevelError(
    formattedErrors: Record<string, string>,
    validationError: ValidationError,
    baseErrorPath: string,
    lang: string,
  ): Promise<void> {
    if (validationError.children && validationError.children.length > 0) {
      await Promise.all(
        validationError.children.map(
          async (childValidationError: ValidationError) => {
            const propertyName = snakeCase(childValidationError.property);
            let errorPath = baseErrorPath;
            // Only append the error path if it does not include the property's name.
            if (!errorPath.includes(propertyName)) {
              errorPath = `${errorPath}.${propertyName}`;
            }
            return this.extractSingleLevelError(
              formattedErrors,
              childValidationError,
              errorPath,
              lang,
            );
          },
        ),
      );
      return;
    }

    formattedErrors[baseErrorPath] = await this.getErrorMessage(
      validationError,
      lang,
    );
  }

  /**
   * Gets the translation of validation message with the highest priority from context.
   * @param validation - Validation error.
   * @param lang - Language to translate to.
   * @returns Translated error message.
   */
  private async getErrorMessage(
    validation: ValidationError,
    lang: string,
  ): Promise<string> {
    // Contexts can be undefined.
    const { contexts, constraints } = validation;
    if (!contexts || !constraints) return 'Validation failed';

    let maxPriorityConstraint = this.getHighestPriorityConstraint(contexts);
    if (!maxPriorityConstraint) {
      maxPriorityConstraint = Object.keys(constraints)[0];
    }

    const context = contexts[maxPriorityConstraint] as TContext;
    // If we have something to translate
    if (context && context.translationKey) {
      return this.translationService.translate(
        `validation.${context.translationKey}`,
        lang,
        context.args,
      );
    }

    return capitalizeString(constraints[maxPriorityConstraint]);
  }

  /**
   * Returns a validation constraint with the highest priority.
   * Lower values of priority represent the higher priority.
   * Example: Constraint with priority 1 is higher in priority than a constraint with priority > 1.
   * @param contexts - Contexts from validation DTO.
   * @returns Context with the highest priority.
   */
  private getHighestPriorityConstraint(contexts?: TContexts): string | null {
    if (!contexts) {
      return null;
    }
    const constraints = Object.keys(contexts);
    if (constraints.length === 0) {
      return null;
    }

    let highestPriorityConstraint: string | null = null;
    for (const constraint of constraints) {
      if (!highestPriorityConstraint) {
        highestPriorityConstraint = constraint;
        continue;
      }

      // The lowest value of priority takes precedent.
      const highestPriority =
        contexts[highestPriorityConstraint].priority || Number.MAX_VALUE;
      const currentPriority = contexts[constraint].priority || Number.MAX_VALUE;
      if (highestPriority > currentPriority) {
        highestPriorityConstraint = constraint;
      }
    }
    return highestPriorityConstraint;
  }

  /**
   * Build field errors from the single level formatted errors.
   * @param errors - Single level formatted errors.
   * @returns Field errors.
   */
  private buildFieldErrors(errors: SingleLevelErrors): FieldError[] {
    const fields = Object.keys(errors);
    const fieldErrors: FieldError[] = [];
    for (const field of fields) {
      fieldErrors.push({ field, error: errors[field] });
    }
    return fieldErrors;
  }

  /**
   * Returns DTO class name.
   * @param exceptionResponse
   * @returns DTO Class name.
   */
  private getTargetDto(exceptionResponse: any): string | undefined {
    return exceptionResponse?.message[0]?.target?.constructor?.name;
  }
}
