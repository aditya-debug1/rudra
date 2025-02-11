import AuditLog from "../models/audit";
import { Request } from "express";

// Update Actor interface to match JWT payload structure
export interface Actor {
  _id: string; // Changed from id to _id to match JWT payload
  username: string;
  roles: string[];
}

class AuditService {
  // Helper method to extract actor info from request
  private getActorFromRequest(req: Request): Actor {
    return {
      _id: req.user._id,
      username: req.user.username,
      roles: req.user.roles,
    };
  }

  async createLog(
    action: "create" | "update" | "delete" | "locked" | "unlocked",
    changes: any,
    req: Request,
    source: string,
    description: string,
  ) {
    const actor = this.getActorFromRequest(req);

    await AuditLog.create({
      event: {
        action,
        changes,
      },
      actor: {
        userId: actor._id,
        username: actor.username,
        roles: actor.roles,
      },
      source,
      description,
      timestamp: new Date(),
    });
  }

  // Updated helper methods to use Request instead of Actor
  async logCreate(
    newData: any,
    req: Request,
    source: string,
    description: string,
  ) {
    const { password, ...auditData } = newData;
    await this.createLog("create", auditData, req, source, description);
  }

  async logUserLockStatus(
    status: "locked" | "unlocked",
    req: Request,
    source: string,
    description: string,
  ) {
    await this.createLog(status, undefined, req, source, description);
  }

  async logUpdate(
    originalData: any,
    updatedData: any,
    req: Request,
    source: string,
    description: string,
  ) {
    const changes = {
      before: originalData,
      after: updatedData,
    };
    await this.createLog("update", changes, req, source, description);
  }

  async logDelete(
    deletedData: any,
    req: Request,
    source: string,
    description: string,
  ) {
    await this.createLog("delete", deletedData, req, source, description);
  }
}

export default new AuditService();
