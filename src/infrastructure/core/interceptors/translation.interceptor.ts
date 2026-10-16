import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Services
import { TranslationService } from '../../i18n/translation.service';

// Response DTO
import {
  MessageResponseDTO,
  SuccessResponseDTO,
} from '../../../common/dtos/res';

@Injectable()
export class TranslationInterceptor implements NestInterceptor {
  constructor(private translationService: TranslationService) {}

  /**
   * Intercepts the request response cycle.
   * @param context - Execution context.
   * @param next - Call handler to continue the cycle.
   * @returns The continued cycle.
   */
  intercept(
    context: ExecutionContext & { i18nLang: string },
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const lang = context
      .switchToHttp()
      .getRequest<Request & { i18nLang: string }>().i18nLang;

    return next.handle().pipe(
      map((response) => {
        if (response instanceof SuccessResponseDTO) {
          return this.translateResponse(response, lang);
        }
        return response;
      }),
    );
  }

  /**
   * Translates the given response.
   * @param response - Success response DTO.
   * @param lang - Desired locale.
   */
  private translateResponse(
    response: SuccessResponseDTO,
    lang: string,
  ): MessageResponseDTO {
    return new MessageResponseDTO(
      this.translationService.getSuccessMessage(response.data, lang),
    );
  }
}
