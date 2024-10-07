import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@prisma';
import { hash, compare } from 'bcrypt';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async register({ fullname, phone_number, password }: RegisterDto) {
    const existingUser = await this.prisma.users.findUnique({
      where: { phone_number },
    });
    if (existingUser) {
      throw new ConflictException('Phone number already exists');
    }

    const hashedPassword = await hash(password, 12);

    const user = await this.prisma.users.create({
      data: { fullname, phone_number, password: hashedPassword },
    });

    const token = this.jwtService.sign({ id: user.id, role: user.role });

    return { message: 'User successfully registered', data: { user, token } };
  }

  async login({ phone_number, password }: LoginDto, expectedRole: string) {
    const user = await this.prisma.users.findUnique({
      where: { phone_number },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('User not found or already deleted');
    }

    if (user.role !== expectedRole) {
      throw new UnauthorizedException(`Only ${expectedRole}s can log in here`);
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Incorrect phone number or password');
    }

    const token = this.jwtService.sign({ id: user.id, role: user.role });

    return {
      message: `${expectedRole} successfully logged in`,
      data: {
        user: {
          ...user,
          password: undefined,
        },
        token,
      },
    };
  }

  async userLogin(loginDto: LoginDto) {
    return this.login(loginDto, 'USER');
  }

  async adminLogin(loginDto: LoginDto) {
    return this.login(loginDto, 'ADMIN');
  }

  async superAdminLogin(loginDto: LoginDto) {
    return this.login(loginDto, 'SUPERADMIN');
  }
}
