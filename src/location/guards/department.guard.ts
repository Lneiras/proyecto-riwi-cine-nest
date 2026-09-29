import { CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { DepartmentService } from "../services/department.service.js";

@Injectable()
export class DepartmentExists implements CanActivate {
  constructor(private readonly service: DepartmentService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const name = req.body?.departmentName || req.params?.departmentName;
    if (!name) throw new NotFoundException("Department name is required in body or params");
    await this.service.findOneByName(name);
    return true;
  }
}
