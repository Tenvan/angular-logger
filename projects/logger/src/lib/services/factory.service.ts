import { Inject, Injectable } from '@angular/core';
import { DEFAULT_METHODS } from '../logger.config';
import { ConsoleService } from './console.service';
import { CssFactory } from './css-factory.service';
import { GroupFactory } from './group-factory.service';
import { LoggerService } from '../logger.service';
import { LoggerOptionsImpl } from '../logger.options';
import {
    ConsoleOperation as Operation,
    GroupFactoryMethod,
    GroupLevel,
    LOGGER_OPTIONS,
    LoggerLevel,
    Pipeline,
    PipeOperation
} from '../interfaces/logger.external';
import { Arguments, Descriptor } from '../interfaces/logger.internal';

@Injectable()
export class LoggerFactory {
    constructor(
        @Inject(LOGGER_OPTIONS) private readonly options: LoggerOptionsImpl,
        private readonly console: ConsoleService,
        private readonly cssFactory: CssFactory,
        private readonly groupFactory: GroupFactory
    ) {}

    public createLogger<T>(level: LoggerLevel, logger: LoggerService): T {
        const args: Arguments = this.getArgumentsByType(level);
        const methodName: string = DEFAULT_METHODS[level];

        const operation: Operation =
            this.console.minLevel <= level ? this.console.instance[methodName].bind(...args) : this.console.noop;

        const pipeOperation: PipeOperation = this.options.useLevelGroup
            ? this.defineLevelGroups(level, operation, logger)
            : operation;

        return (pipeOperation as unknown) as T;
    }

    private defineLevelGroups(level: LoggerLevel, operation: Operation, logger: LoggerService): Operation {
        const { GROUP, GROUP_COLLAPSED }: typeof GroupLevel = GroupLevel;

        Object.defineProperties(operation, {
            [GROUP]: this.setGroupMethod(GROUP, level, logger),
            [GROUP_COLLAPSED]: this.setGroupMethod(GROUP_COLLAPSED, level, logger)
        });

        return operation;
    }

    private setGroupMethod(methodName: GroupLevel, level: LoggerLevel, logger: LoggerService): Descriptor {
        return {
            enumerable: true,
            configurable: true,
            value: (label: string, pipeLine?: Pipeline): LoggerService => {
                const groupMethod: GroupFactoryMethod = this.groupFactory[methodName].bind(this.groupFactory);
                groupMethod(label, pipeLine, logger, level);

                return logger;
            }
        };
    }

    private getArgumentsByType(level: LoggerLevel): Arguments {
        const styleLabel: string = this.cssFactory.getStyleLabel(level);
        const lineStyle: string = this.cssFactory.style;
        const args: Arguments = [this.console.instance];
        const withLabel: boolean = level !== LoggerLevel.LOG;

        if (withLabel) {
            if (lineStyle) {
                args.push(this.console.getFormatTemplateLabel(level), styleLabel, lineStyle);
            } else {
                args.push(this.console.getTemplateLabel(level), styleLabel);
            }
        } else if (lineStyle) {
            args.push(this.console.getTemplateWithoutLabel(), lineStyle);
        }

        return args;
    }
}
