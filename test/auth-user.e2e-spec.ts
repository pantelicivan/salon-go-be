import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

// Modules
import { AppModule } from '../src/application/app.module';

// Services
import { AuthService } from '../src/application/auth/services/auth.service';
import { UserService } from '../src/application/user/user.service';

// Entities
import { User } from '../src/database/entities';

// Contracts
import { AuthTokens } from '../src/application/auth/contracts/auth.contracts';

// Async results
import { isErr } from '../src/infrastructure/core/results/errors/result';

describe('Auth', () => {
  let app: INestApplication;

  const testUser = {
    email: 'ivan.pantelic@quantox.com',
    password: 'ivan.pantelic',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it(`GET /auth/user`, async () => {
    const userFromDB = await findOne(app, testUser.email);
    if (!userFromDB) return expect(userFromDB).not.toBeNull();

    const tokens = await logIn(app, testUser.email, testUser.password);
    if (!tokens) return expect(tokens).not.toBeNull();

    const response = await request(app.getHttpServer())
      .get('/auth/user')
      .set('Authorization', `Bearer ${tokens.bearerTokens.accessToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('user');
    expect(response.body.user.id).toBe(userFromDB.id);
    expect(response.body.user.email).toBe(userFromDB.email);
  });

  afterAll(async () => {
    await app.close();
  });
});

/**
 * Login user with email and password.
 * @param app Nest application
 * @param email User email
 * @param password User password
 * @returns AuthTokens or null
 */
const logIn = async (
  app: INestApplication,
  email: string,
  password: string,
): Promise<AuthTokens | null> => {
  const logginResult = await app.get(AuthService).login(email, password);
  return !isErr(logginResult) ? logginResult.value : null;
};

/**
 * Find user by email.
 * @param app Nest application
 * @param email User's email
 * @returns User if found
 */
const findOne = async (
  app: INestApplication,
  email: string,
): Promise<User | null> => {
  return app.get(UserService).findOne({ email });
};
