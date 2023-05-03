import log4js from 'log4js';
import loggerConfig from '../configs/logger.config';

log4js.configure(loggerConfig);

export const console = log4js.getLogger('console');
export const logger = log4js.getLogger('debug');
export const access = log4js.getLogger('access');
export const express = log4js.connectLogger( log4js.getLogger('access'), { level: log4js.levels.INFO.levelStr } );
