import { Component, OnInit } from '@angular/core';
import { LoggerService } from '../projects/logger/src/lib/logger.service';
import { Logger } from '../projects/logger/src/lib/decorators/logger.decorator';
import { Debug } from '../projects/logger/src/lib/decorators/debug.decorator';
import { Trace } from '../projects/logger/src/lib/decorators/trace.decorator';
import { Info } from '../projects/logger/src/lib/decorators/info.decorator';
import { Error as ErrorLog } from '../projects/logger/src/lib/decorators/error.decorator';
import { Warn } from '../projects/logger/src/lib/decorators/warn.decorator';
import { Log } from '../projects/logger/src/lib/decorators/log.decorator';
import { Group } from '../projects/logger/src/lib/decorators/groups/group.decorator';
import { GroupCollapsed } from '../projects/logger/src/lib/decorators/groups/group-collapsed.decorator';
import { LoggerLevel } from '../projects/logger/src/lib/logger.config';
import { LogFn, TimerInfo } from '../projects/logger/src/lib/logger.interfaces';
import { Timer } from '../projects/logger/src/lib/decorators/timer.decorator';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({ selector: 'lib-hello-test', template: '' })
export class MyTestComponent implements OnInit {
    @Logger() public logger: LoggerService;
    @Trace() public trace: LogFn;
    @Debug() public debug: LogFn;
    @Info() public info: LogFn;
    @ErrorLog() public error: LogFn;
    @Warn() public warn: LogFn;
    @Log() public log: LogFn;

    public count: number = 0;
    public hook: string;
    public doneHeavy: boolean;
    public name: string = 'MockLoggerComponent';

    @Group('Test group')
    public print(val: string): string {
        this.logger.log(val);
        return val;
    }

    @Group('Test group', LoggerLevel.WARN)
    public printLevel(val: string): string {
        this.logger.log(val);
        return val;
    }

    @GroupCollapsed('Test group-collapsed')
    public printCollapsed(val: string): string {
        this.logger.log(val);
        return val;
    }

    @GroupCollapsed('Test group-collapsed', LoggerLevel.WARN)
    public printCollapsedLevel(val: string): string {
        this.logger.log(val);
        return val;
    }

    public init(): void {
        this.logger.level = LoggerLevel.INFO;
        this.increment();
    }

    @Group('INCREMENT', LoggerLevel.DEBUG)
    public increment(): void {
        this.logger.debug('count', this.count);
        this.count++;
    }

    @Group((name: string) => `Test group with ${name}`)
    public method(name: string): string {
        this.logger.log('group is worked');
        return name;
    }

    @Timer('mock:ngOnInit')
    public ngOnInit(): void {
        this.hook = 'ngOnInit';
    }

    @Timer('longQueryBySecond', LoggerLevel.INFO, false)
    public longQueryBySecond(seconds: number, done: any): void {
        this.extracted(seconds, done);
    }

    public longQueryBySecondMs(seconds: number, done: any): void {
        const info: TimerInfo = this.logger.startTime('longQueryBySecondMs');
        this.extracted(seconds, done);
        this.logger.endTime(info);
    }

    @Timer('badRequest', LoggerLevel.DEBUG, false)
    public badRequest(): void {
        throw new Error('error');
    }

    private extracted(seconds: number, done: any): void {
        const e: number = new Date().getTime() + seconds * 1000;
        while (new Date().getTime() <= e) {
            this.doneHeavy = true;
        }
        done();
    }
}
