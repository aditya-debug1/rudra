import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ClientPartner, CPEmployee } from "../models/client-partner";
import auditService from "../utils/audit-service";
import createError from "../utils/createError";

class ClientPartnerController {
  // Get all client partners (exclude soft deleted ones)
  async getAllClientPartners(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const pageNumber = Number(page);
      const limitNumber = Number(limit);
      const skip = (pageNumber - 1) * limitNumber;

      // Build query object - exclude deleted records
      let query: any = { isDeleted: { $ne: true } };

      // Handle search
      if (search) {
        const searchTerms = (search as string).trim().split(/\s+/);
        const searchConditions: any[] = searchTerms.map((term) => {
          const termRegex = new RegExp(term, "i");
          return {
            $or: [
              { name: termRegex },
              { email: termRegex },
              { phoneNo: termRegex },
            ],
          };
        });

        if (searchConditions.length > 0) {
          query = {
            $and: [{ isDeleted: { $ne: true } }, { $and: searchConditions }],
          };
        }
      }

      // Get total count for pagination info
      const totalCount = await ClientPartner.countDocuments(query);

      // Get paginated results with search applied
      const clientPartners = await ClientPartner.find(query)
        .populate({
          path: "employees",
          match: { isDeleted: { $ne: true } },
        })
        .skip(skip)
        .sort({ createdAt: -1 })
        .limit(limitNumber);

      res.status(200).json({
        totalClientPartners: totalCount,
        totalPages: Math.ceil(totalCount / limitNumber),
        currentPage: pageNumber,
        limitNumber: limitNumber,
        clientPartners,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Server Error",
        ),
      );
    }
  }

  // Get single client partner (exclude soft deleted ones)
  async getClientPartner(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const clientPartner = await ClientPartner.findOne({
        _id: req.params.id,
        isDeleted: { $ne: true },
      }).populate({
        path: "employees",
        match: { isDeleted: { $ne: true } },
        populate: {
          path: "referredClients",
          populate: {
            path: "client",
            select: "_id firstName lastName",
          },
        },
      });

      if (!clientPartner) {
        next(createError(404, "Client partner not found"));
        return;
      }

      res.status(200).json(clientPartner);
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        next(createError(400, "Invalid ID format"));
        return;
      }

      next(
        createError(
          500,
          error instanceof Error ? error.message : "Server Error",
        ),
      );
    }
  }

  // Get employee references for all client partners (with option to include deleted ones)
  async getReference(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Check if we should include deleted records (defaults to false)
      const includeDeleted = req.query.includeDeleted === "true";

      // Build query conditions
      let employeeQuery: any = {};
      let clientPartnerQuery: any = {};

      if (!includeDeleted) {
        employeeQuery.isDeleted = { $ne: true };
        clientPartnerQuery.isDeleted = { $ne: true };
      }

      // Get all employees with populated client partner info
      const employees = await CPEmployee.find(employeeQuery).populate({
        path: "clientPartnerId",
        match: clientPartnerQuery,
        select: "name",
      });

      // Filter out employees whose clientPartner was filtered out by the populate match
      const references = employees
        .filter((emp) => emp.clientPartnerId) // Only include employees with valid client partners
        .map((emp) => ({
          _id: emp._id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          companyName: (emp.clientPartnerId as any).name,
        }));

      res.status(200).json({
        references,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Server Error",
        ),
      );
    }
  }

  // Create client partner
  async createClientPartner(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        cpId,
        name,
        ownerName,
        email,
        phoneNo,
        address,
        notes,
        website: companyWebsite,
        employees = [],
      } = req.body;

      // Create client partner
      const clientPartner = new ClientPartner({
        cpId,
        name,
        ownerName,
        email,
        phoneNo,
        address,
        notes,
        companyWebsite,
        createdBy: req.user.username,
      });

      await clientPartner.save();

      // Create employees if any
      const createdEmployees = [];
      const employeeIds = [];

      if (employees.length > 0) {
        for (const emp of employees) {
          const employee = new CPEmployee({
            clientPartnerId: clientPartner._id,
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            phoneNo: emp.phoneNo,
            altNo: emp.altNo,
            position: emp.position,
            commissionPercentage: emp.commissionPercentage,
          });

          await employee.save();
          createdEmployees.push(employee);
          employeeIds.push(employee._id);

          // Audit log for each employee creation
          await auditService.logCreate(
            employee.toObject(),
            req,
            "CPEmployee",
            `Created employee: ${employee.firstName} ${employee.lastName} for client partner: ${clientPartner.name}`,
          );
        }

        // Add employee references to client partner
        if (employeeIds.length > 0) {
          clientPartner.employees = employeeIds;
          await clientPartner.save();
        }
      }

      // Create audit log for client partner creation
      await auditService.logCreate(
        clientPartner.toObject(),
        req,
        "ClientPartner",
        `Created client partner: ${clientPartner.name} with ${employeeIds.length} employees`,
      );

      res.status(201).json({
        message: "Client partner created successfully",
        clientPartner,
        employees: createdEmployees,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error
            ? error.message
            : "Error creating client partner",
        ),
      );
    }
  }

  // Update client partner (don't update deleted ones)
  async updateClientPartner(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Get original data for audit logging
      const originalClientPartner = await ClientPartner.findOne({
        _id: req.params.id,
        isDeleted: { $ne: true },
      });

      if (!originalClientPartner) {
        next(createError(404, "Client partner not found"));
        return;
      }

      const clientPartner = await ClientPartner.findOneAndUpdate(
        { _id: req.params.id, isDeleted: { $ne: true } },
        { ...req.body, updatedBy: req.user.username },
        { new: true, runValidators: true },
      ).populate({
        path: "employees",
        match: { isDeleted: { $ne: true } },
        populate: {
          path: "referredClients",
          populate: {
            path: "client",
            select: "_id firstName lastName",
          },
        },
      });

      // Create audit log for client partner update
      await auditService.logUpdate(
        originalClientPartner.toObject(),
        clientPartner!.toObject(),
        req,
        "ClientPartner",
        `Updated client partner: ${clientPartner!.name}`,
      );

      res.status(200).json({
        message: "Client Partner updated successfully",
        cp: clientPartner,
      });
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        next(createError(400, "Invalid ID format"));
        return;
      }

      if (error instanceof mongoose.Error.ValidationError) {
        const messages = Object.values(error.errors).map((val) => val.message);
        next(createError(400, messages.join(", ")));
        return;
      }

      next(
        createError(
          500,
          error instanceof Error ? error.message : "Server Error",
        ),
      );
    }
  }

  // Soft delete client partner (set isDeleted flag instead of removing)
  async deleteClientPartner(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Get original data for audit logging
      const originalClientPartner = await ClientPartner.findOne({
        _id: req.params.id,
        isDeleted: { $ne: true },
      });

      if (!originalClientPartner) {
        next(createError(404, "Client partner not found"));
        return;
      }

      const clientPartner = await ClientPartner.findOneAndUpdate(
        { _id: req.params.id, isDeleted: { $ne: true } },
        { isDeleted: true },
        { new: true },
      );

      // Create audit log for client partner soft delete
      await auditService.logDelete(
        originalClientPartner.toObject(),
        req,
        "ClientPartner",
        `Soft deleted client partner: ${originalClientPartner.name}`,
      );

      res.status(200).json({
        message: "Client Partner deleted successfully",
        cpId: clientPartner!._id,
      });
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        next(createError(400, "Invalid ID format"));
        return;
      }

      next(
        createError(
          500,
          error instanceof Error ? error.message : "Server Error",
        ),
      );
    }
  }

  // Hard delete client partner (for administrative purposes)
  async hardDeleteClientPartner(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Start a session for transaction
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Find the client partner
        const clientPartner = await ClientPartner.findById(
          req.params.id,
        ).session(session);

        if (!clientPartner) {
          await session.abortTransaction();
          session.endSession();
          next(createError(404, "Client partner not found"));
          return;
        }

        // Get associated employees for audit logging
        const associatedEmployees = await CPEmployee.find({
          clientPartnerId: clientPartner._id,
        }).session(session);

        // Delete all associated employees
        await CPEmployee.deleteMany({
          clientPartnerId: clientPartner._id,
        }).session(session);

        // Delete the client partner
        await ClientPartner.findByIdAndDelete(req.params.id).session(session);

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        // Create audit log for hard delete (after successful transaction)
        await auditService.logDelete(
          {
            clientPartner: clientPartner.toObject(),
            deletedEmployees: associatedEmployees.map((emp) => emp.toObject()),
          },
          req,
          "ClientPartner",
          `Hard deleted client partner: ${clientPartner.name} and ${associatedEmployees.length} associated employees`,
        );

        res.status(200).json({
          message:
            "Client Partner and all associated employees permanently deleted",
          cpId: clientPartner._id,
        });
      } catch (error) {
        // Abort transaction on error
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        next(createError(400, "Invalid ID format"));
        return;
      }

      next(
        createError(
          500,
          error instanceof Error ? error.message : "Server Error",
        ),
      );
    }
  }

  // Add employee to client partner
  async addEmployee(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const clientPartnerId = req.params.id;

      // Check if client partner exists and not deleted
      const clientPartner = await ClientPartner.findOne({
        _id: clientPartnerId,
        isDeleted: { $ne: true },
      });

      if (!clientPartner) {
        next(createError(404, "Client partner not found"));
        return;
      }

      // Create new employee
      const employeeData = {
        ...req.body,
        clientPartnerId: clientPartnerId,
      };

      const newEmployee = await CPEmployee.create(employeeData);

      // Add employee reference to client partner
      clientPartner.employees.push(newEmployee._id);
      await clientPartner.save();

      // Create audit log for employee addition
      await auditService.logCreate(
        newEmployee.toObject(),
        req,
        "CPEmployee",
        `Added employee: ${newEmployee.firstName} ${newEmployee.lastName} to client partner: ${clientPartner.name}`,
      );

      // Fetch the updated client partner with populated employees
      const updatedClientPartner = await ClientPartner.findById(
        clientPartnerId,
      ).populate({
        path: "employees",
        match: { isDeleted: { $ne: true } },
        populate: {
          path: "referredClients",
          populate: {
            path: "client",
            select: "_id firstName lastName",
          },
        },
      });

      res.status(200).json({
        message: "Client partner employee created successfully",
        cp: updatedClientPartner,
      });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        const messages = Object.values(error.errors).map((val) => val.message);
        next(createError(400, messages.join(", ")));
        return;
      }

      next(
        createError(
          500,
          error instanceof Error ? error.message : "Server Error",
        ),
      );
    }
  }

  // Update employee from client partner (don't update deleted employees)
  async updateEmployee(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id, employeeId } = req.params;

      // First verify the client partner exists and is not deleted
      const clientPartner = await ClientPartner.findOne({
        _id: id,
        isDeleted: { $ne: true },
      });

      if (!clientPartner) {
        next(createError(404, "Client partner not found"));
        return;
      }

      // Check if the employee exists and belongs to this client partner
      const originalEmployee = await CPEmployee.findOne({
        _id: employeeId,
        clientPartnerId: id,
        isDeleted: { $ne: true },
      });

      if (!originalEmployee) {
        next(createError(404, "Employee not found"));
        return;
      }

      // Update the employee
      const updatedEmployee = await CPEmployee.findByIdAndUpdate(
        employeeId,
        req.body,
        { new: true, runValidators: true },
      );

      // Create audit log for employee update
      await auditService.logUpdate(
        originalEmployee.toObject(),
        updatedEmployee!.toObject(),
        req,
        "CPEmployee",
        `Updated employee: ${updatedEmployee!.firstName} ${updatedEmployee!.lastName} in client partner: ${clientPartner.name}`,
      );

      // Get the updated client partner with populated employees
      const updatedClientPartner = await ClientPartner.findById(id).populate({
        path: "employees",
        match: { isDeleted: { $ne: true } },
        populate: {
          path: "referredClients",
          populate: {
            path: "client",
            select: "_id firstName lastName",
          },
        },
      });

      res.status(200).json({
        message: "Client partner employee updated successfully",
        cp: updatedClientPartner,
      });
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        next(createError(400, "Invalid ID format"));
        return;
      }

      if (error instanceof mongoose.Error.ValidationError) {
        const messages = Object.values(error.errors).map((val) => val.message);
        next(createError(400, messages.join(", ")));
        return;
      }

      next(
        createError(
          500,
          error instanceof Error ? error.message : "Server Error",
        ),
      );
    }
  }

  // Soft delete employee from client partner
  async removeEmployee(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id, employeeId } = req.params;

      // First verify the client partner exists and is not deleted
      const clientPartner = await ClientPartner.findOne({
        _id: id,
        isDeleted: { $ne: true },
      });

      if (!clientPartner) {
        next(createError(404, "Client partner not found"));
        return;
      }

      // Check if the employee exists, belongs to this client partner, and is not already deleted
      const employee = await CPEmployee.findOne({
        _id: employeeId,
        clientPartnerId: id,
        isDeleted: { $ne: true },
      });

      if (!employee) {
        next(createError(404, "Employee not found"));
        return;
      }

      // Store original data for audit logging
      const originalEmployeeData = employee.toObject();

      // Soft delete the employee
      employee.isDeleted = true;
      await employee.save();

      // Create audit log for employee soft delete
      await auditService.logDelete(
        originalEmployeeData,
        req,
        "CPEmployee",
        `Soft deleted employee: ${employee.firstName} ${employee.lastName} from client partner: ${clientPartner.name}`,
      );

      // Get the updated client partner with populated employees
      const updatedClientPartner = await ClientPartner.findById(id).populate({
        path: "employees",
        match: { isDeleted: { $ne: true } },
        populate: {
          path: "referredClients",
          populate: {
            path: "client",
            select: "_id firstName lastName",
          },
        },
      });

      res.status(200).json({
        message: "Client partner employee deleted successfully",
        cp: updatedClientPartner,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Server Error",
        ),
      );
    }
  }

  // Hard remove employee from client partner (for administrative purposes)
  async hardRemoveEmployee(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id, employeeId } = req.params;

      // First verify the client partner exists
      const clientPartner = await ClientPartner.findById(id);

      if (!clientPartner) {
        next(createError(404, "Client partner not found"));
        return;
      }

      // Check if the employee exists and belongs to this client partner
      const employee = await CPEmployee.findOne({
        _id: employeeId,
        clientPartnerId: id,
      });

      if (!employee) {
        next(createError(404, "Employee not found"));
        return;
      }

      // Store original data for audit logging
      const originalEmployeeData = employee.toObject();

      // Remove employee reference from client partner
      clientPartner.employees = clientPartner.employees.filter(
        (empId) => empId.toString() !== employeeId,
      );
      await clientPartner.save();

      // Hard delete the employee
      await CPEmployee.findByIdAndDelete(employeeId);

      // Create audit log for employee hard delete
      await auditService.logDelete(
        originalEmployeeData,
        req,
        "CPEmployee",
        `Hard deleted employee: ${employee.firstName} ${employee.lastName} from client partner: ${clientPartner.name}`,
      );

      // Get the updated client partner with populated employees
      const updatedClientPartner = await ClientPartner.findById(id).populate({
        path: "employees",
        match: { isDeleted: { $ne: true } },
        populate: {
          path: "referredClients",
          populate: {
            path: "client",
            select: "_id firstName lastName",
          },
        },
      });

      res.status(200).json({
        message: "Client partner employee permanently removed",
        cp: updatedClientPartner,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Server Error",
        ),
      );
    }
  }

  // Restore a soft deleted client partner
  async restoreClientPartner(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Get original data for audit logging
      const originalClientPartner = await ClientPartner.findOne({
        _id: req.params.id,
        isDeleted: true,
      });

      if (!originalClientPartner) {
        next(createError(404, "Deleted client partner not found"));
        return;
      }

      const clientPartner = await ClientPartner.findOneAndUpdate(
        { _id: req.params.id, isDeleted: true },
        { isDeleted: false },
        { new: true },
      ).populate({
        path: "employees",
        match: { isDeleted: { $ne: true } },
        populate: {
          path: "referredClients",
          populate: {
            path: "client",
            select: "_id firstName lastName",
          },
        },
      });

      // Create audit log for client partner restore
      await auditService.logUpdate(
        { ...originalClientPartner.toObject(), isDeleted: true },
        clientPartner!.toObject(),
        req,
        "ClientPartner",
        `Restored client partner: ${clientPartner!.name}`,
      );

      res.status(200).json({
        message: "Client Partner restored successfully",
        cp: clientPartner,
      });
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        next(createError(400, "Invalid ID format"));
        return;
      }

      next(
        createError(
          500,
          error instanceof Error ? error.message : "Server Error",
        ),
      );
    }
  }

  // Restore a soft deleted employee
  async restoreEmployee(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id, employeeId } = req.params;

      // First verify the client partner exists
      const clientPartner = await ClientPartner.findById(id);

      if (!clientPartner) {
        next(createError(404, "Client partner not found"));
        return;
      }

      // Check if the employee exists, belongs to this client partner, and is deleted
      const employee = await CPEmployee.findOne({
        _id: employeeId,
        clientPartnerId: id,
        isDeleted: true,
      });

      if (!employee) {
        next(createError(404, "Deleted employee not found"));
        return;
      }

      // Store original data for audit logging
      const originalEmployeeData = { ...employee.toObject(), isDeleted: true };

      // Restore the employee
      employee.isDeleted = false;
      await employee.save();

      // Create audit log for employee restore
      await auditService.logUpdate(
        originalEmployeeData,
        employee.toObject(),
        req,
        "CPEmployee",
        `Restored employee: ${employee.firstName} ${employee.lastName} in client partner: ${clientPartner.name}`,
      );

      // Get the updated client partner with populated employees
      const updatedClientPartner = await ClientPartner.findById(id).populate({
        path: "employees",
        match: { isDeleted: { $ne: true } },
        populate: {
          path: "referredClients",
          populate: {
            path: "client",
            select: "_id firstName lastName",
          },
        },
      });

      res.status(200).json({
        message: "Client partner employee restored successfully",
        cp: updatedClientPartner,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Server Error",
        ),
      );
    }
  }
}

export default new ClientPartnerController();
