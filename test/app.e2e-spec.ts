import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto/auth.dto';
import { EditUserDto } from 'src/user/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3003);

    prisma = app.get(PrismaService);
    await prisma.cleanDB();
    pactum.request.setBaseUrl('http://localhost:3003');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'avotraismael@gmail.com',
      password: '123456',
    };
    describe('Signup', () => {
      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('should throw if no body is provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
      it('should create a new user', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
          .inspect();
      });
      describe('Signin', () => {
        it('should throw if email is empty', () => {
          return pactum
            .spec()
            .post('/auth/signin')
            .withBody({
              password: dto.password,
            })
            .expectStatus(400);
        });
        it('should throw if password is empty', () => {
          return pactum
            .spec()
            .post('/auth/signin')
            .withBody({
              email: dto.email,
            })
            .expectStatus(400);
        });
        it('should throw if no body is provided', () => {
          return pactum.spec().post('/auth/signin').expectStatus(400).inspect();
        });

        it('should return a token', async () => {
          return pactum
            .spec()
            .post('/auth/signin')
            .withBody(dto)
            .expectStatus(200)
            .stores('userAt', 'access_token');
        });
      });
    });

    describe('User', () => {
      describe('Get me', () => {
        it('should return the user', () => {
          return pactum
            .spec()
            .get('/users/me')
            .withHeaders({
              Authorization: 'Bearer $S{userAt}',
            })
            .expectStatus(200)
            .inspect();
        });
      });
      describe('Edit user', () => {
          it('should edit the user', () => {
            const dto: EditUserDto = {
              firstName: 'ismael',
              lastName: 'avotra',
              email: 'avotraismael@gmail.com',
            };
            return pactum
              .spec()
              .patch('/users')
              .withHeaders({
                Authorization: 'Bearer $S{userAt}',
              })
              .withBody(dto)
              .expectStatus(200)
              .expectBodyContains(dto.firstName)
              .expectBodyContains(dto.lastName)
              .expectBodyContains(dto.email);
          });
      });
    });

    describe('Bookmarks', () => {
      describe('Get bookmarks', () => {});
      describe('Get bookmark by id', () => {});
      describe('Create bookmark', () => {});
      describe('Edit bookmark by id', () => {});
      describe('Delete bookmark by id', () => {});
    });
  });
});
