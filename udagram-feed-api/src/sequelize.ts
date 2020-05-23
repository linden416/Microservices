import {Sequelize} from 'sequelize-typescript';
import { config } from './config/config';


const c = config.dev.postgres;

// Instantiate new Sequelize instance!
export const sequelize = new Sequelize({
  /* "username": "postgres",
  "password": "M4r4vich#!",
  "database": "udagramseelerdev",
  "host":     "udagramseelerdev.c3nnsqm0pe8o.us-east-2.rds.amazonaws.com", */
  username: c.username,
  password: c.password,
  database: c.database,
  host: c.host,
  dialect: c.dialect,
  storage: ':memory:',
  logging: true
});
