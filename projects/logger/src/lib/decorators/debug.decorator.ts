import { LogFn } from './../logger.interfaces';
import { LoggerModule } from './../logger.module';
import { Type } from '@angular/core';

export function DebugLog(): PropertyDecorator {
    return (target: Type<unknown>, propertyName: string): void => {
        Object.defineProperty(target, propertyName, {
            configurable: false,
            get(): LogFn {
                return LoggerModule.logger.debug;
            }
        });
    };
}
