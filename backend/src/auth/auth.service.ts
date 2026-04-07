import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(login: string, pass: string): Promise<any> {
    // 1. Check User table (Staff)
    // @ts-ignore
    const user = await this.prisma.user.findUnique({ 
      where: { login },
      include: { center: true }
    });
    if (user && user.password === pass) {
      return { 
        id: user.id, 
        login: user.login, 
        name: user.name,
        role: user.role, 
        // @ts-ignore
        centerId: user.centerId,
        // @ts-ignore
        centerName: user.center?.name || 'Markaz'
      };
    }

    // 2. Legacy Center login (Auto-Role: OWNER)
    const center = await this.prisma.center.findUnique({ where: { login } });
    if (center && center.password === pass) {
      return { 
        id: center.id, 
        login: center.login, 
        role: 'OWNER', 
        centerId: center.id,
        centerName: center.name
      };
    }
    
    // 3. Setup Super Admin
    if (login === 'admin' && pass === 'admin123') {
       return { id: 0, login: 'admin', role: 'SUPER_ADMIN', centerId: null };
    }

    return null;
  }

  async login(user: any) {
    const payload = { 
      login: user.login, 
      sub: user.id || 0, 
      role: user.role, 
      centerId: user.centerId,
      name: user.name || user.login
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        login: user.login,
        role: user.role,
        displayName: user.name || 'Xodim',
        centerId: user.centerId,
        centerName: user.centerName || 'Markaz'
      }
    };
  }
}
