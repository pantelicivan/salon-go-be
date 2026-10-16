import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

// Contracts
import { ErrorLike } from '../core/results/errors/result';
import { SuccessLike } from '../core/results/success/result';

@Injectable()
export class TranslationService {
  constructor(private i18n: I18nService) {}

  /**
   * Gets translation for the given translation key and lang.
   * @param translationKey - Path to the translation.
   * @param lang - Desired language.
   * @param args - Passed arguments.
   * @returns Translation
   */
  public translate(
    translationKey: string,
    lang: string,
    args?: Record<string, string>,
  ): string {
    return this.i18n.translate(translationKey, { lang, args });
  }

  /**
   * Tries to translate the given exception based on its code.
   * @param exception - An error like object (A custom error)
   * @param lang - Desired language.
   * @returns The translated error message.
   */
  public getExceptionMessage(exception: ErrorLike, lang: string): string {
    const translationKey = `exception.${exception.code}`;

    const translation = this.translate(
      translationKey,
      lang,
      this.translateArguments(lang, exception.args),
    );
    // If translation is equal to the translation key, then there is no localisation for the provided message.
    if (translation == translationKey) {
      return this.getMessage(exception.message, lang);
    }

    return translation;
  }

  /**
   * Tries to translate the given success object based on its code.
   * @param success - An success like object
   * @param lang - Desired language.
   * @returns The translated success message.
   */
  public getSuccessMessage(success: SuccessLike, lang: string): string {
    const translationKey = `success.${success.code}`;

    const translation = this.translate(translationKey, lang);
    // If translation is equal to the translation key, then there is no localisation for the provided message.
    if (translation == translationKey) {
      return this.getMessage(success.message, lang);
    }

    return translation;
  }

  /**
   * Tries to translate the given error message.
   * @param errorMessage - An error message string.
   * @param lang - Desired language.
   * @returns The translated error message.
   */
  public getMessage(errorMessage: string, lang: string): string {
    const translationKey = `message.${errorMessage}`;
    const translation = this.translate(translationKey, lang);
    // If translation is equal to the translation key, then there is no localisation for the provided message.
    if (translation == translationKey) {
      return errorMessage;
    }
    return translation;
  }

  /**
   * Tries to translate the given arguments.
   * @param args - An object containing arguments values.
   * @param lang - Desired language.
   * @returns Translated arguments.
   */
  public translateArguments(
    lang: string,
    args?: Record<string, string>,
  ): Record<string, string> {
    if (!args) return {};
    for (const key of Object.keys(args)) {
      const translationKey = `dictionary.${args[key]}`;
      const translation = this.translate(translationKey, lang);
      if (translation == translationKey) {
        continue;
      }
      args[key] = translation;
    }
    return args;
  }
}
