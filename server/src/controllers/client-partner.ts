// controllers/clientPartnerController.ts
import { NextFunction, Request, Response } from "express";
import { ClientPartner } from "../models/client-partner";
import mongoose from "mongoose";
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
      let query: any = { isDeleled: { $ne: true } };

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
            $and: [{ isDeleled: { $ne: true } }, { $and: searchConditions }],
          };
        }
      }

      // Get total count for pagination info
      const totalCount = await ClientPartner.countDocuments(query);

      // Get paginated results with search applied
      const clientPartners = await ClientPartner.find(query)
        .skip(skip)
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
        isDeleled: { $ne: true },
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

  // Get employee references for all client partners (exclude soft deleted ones)
  async getReference(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Use MongoDB aggregation to transform the data at the database level
      const references = await ClientPartner.aggregate([
        // Match non-deleted client partners
        { $match: { isDeleled: { $ne: true } } },
        // Unwind the employees array to create a document for each employee
        { $unwind: "$employees" },
        // Match non-deleted employees
        { $match: { "employees.isDeleled": { $ne: true } } },
        // Project only the fields we need
        {
          $project: {
            _id: "$employees._id",
            firstName: "$employees.firstName",
            lastName: "$employees.lastName",
            companyName: "$name",
          },
        },
      ]);

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
  async createClientPartner(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const clientPartner = await ClientPartner.create(req.body);

      res.status(201).json({
        message: "Client Partner created successfully",
        cp: clientPartner,
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

  // Update client partner (don't update deleted ones)
  async updateClientPartner(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const clientPartner = await ClientPartner.findOneAndUpdate(
        { _id: req.params.id, isDeleled: { $ne: true } },
        req.body,
        { new: true, runValidators: true },
      );

      if (!clientPartner) {
        next(createError(404, "Client partner not found"));
        return;
      }

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
      const clientPartner = await ClientPartner.findOneAndUpdate(
        { _id: req.params.id, isDeleled: { $ne: true } },
        { isDeleled: true },
        { new: true },
      );

      if (!clientPartner) {
        next(createError(404, "Client partner not found"));
        return;
      }

      res.status(200).json({
        message: "Client Partner deleted successfully",
        cpId: clientPartner._id,
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
      const clientPartner = await ClientPartner.findByIdAndDelete(
        req.params.id,
      );

      if (!clientPartner) {
        next(createError(404, "Client partner not found"));
        return;
      }

      res.status(200).json({
        message: "Client Partner permanently deleted",
        cpId: clientPartner._id,
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

  // Add employee to client partner
  async addEmployee(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const clientPartner = await ClientPartner.findOne({
        _id: req.params.id,
        isDeleled: { $ne: true },
      });

      if (!clientPartner) {
        next(createError(404, "Client partner not found"));
        return;
      }

      clientPartner.employees.push(req.body);
      await clientPartner.save();

      res.status(200).json({
        message: "Client partner employee created successfully",
        cp: clientPartner,
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

      const clientPartner = await ClientPartner.findOne({
        _id: id,
        isDeleled: { $ne: true },
      });

      if (!clientPartner) {
        next(createError(404, "Client partner not found"));
        return;
      }

      const employeeIndex = clientPartner.employees.findIndex(
        (emp) => emp._id.toString() === employeeId && emp.isDeleted !== true,
      );

      if (employeeIndex === -1) {
        next(createError(404, "Employee not found"));
        return;
      }

      // Type-safe approach to update employee fields
      const employee = clientPartner.employees[employeeIndex];
      const updatedData = req.body;

      // Update only the fields that exist in the schema
      if (updatedData.firstName !== undefined)
        employee.firstName = updatedData.firstName;
      if (updatedData.lastName !== undefined)
        employee.lastName = updatedData.lastName;
      if (updatedData.email !== undefined) employee.email = updatedData.email;
      if (updatedData.phoneNo !== undefined)
        employee.phoneNo = updatedData.phoneNo;
      if (updatedData.altNo !== undefined) employee.altNo = updatedData.altNo;
      if (updatedData.position !== undefined)
        employee.position = updatedData.position;
      if (updatedData.commissionPercentage !== undefined)
        employee.commissionPercentage = updatedData.commissionPercentage;
      // Don't update referredClients directly as this would require special handling

      await clientPartner.save();

      res.status(200).json({
        message: "Client partner employee updated successfully",
        cp: clientPartner,
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

  // Soft delete employee from client partner
  async removeEmployee(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id, employeeId } = req.params;

      const clientPartner = await ClientPartner.findOne({
        _id: id,
        isDeleled: { $ne: true },
      });

      if (!clientPartner) {
        next(createError(404, "Client partner not found"));
        return;
      }

      // Find the employee
      const employeeIndex = clientPartner.employees.findIndex(
        (emp) => emp._id.toString() === employeeId && emp.isDeleted !== true,
      );

      if (employeeIndex === -1) {
        next(createError(404, "Employee not found"));
        return;
      }

      // Soft delete the employee by setting isDeleled flag
      clientPartner.employees[employeeIndex].isDeleted = true;

      await clientPartner.save();

      res.status(200).json({
        message: "Client partner employee deleted successfully",
        cp: clientPartner,
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

      const clientPartner = await ClientPartner.findById(id);

      if (!clientPartner) {
        next(createError(404, "Client partner not found"));
        return;
      }

      // Hard remove the employee
      clientPartner.employees = clientPartner.employees.filter(
        (emp) => emp._id.toString() !== employeeId,
      );

      await clientPartner.save();

      res.status(200).json({
        message: "Client partner employee permanently removed",
        cp: clientPartner,
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
      const clientPartner = await ClientPartner.findOneAndUpdate(
        { _id: req.params.id, isDeleled: true },
        { isDeleled: false },
        { new: true },
      );

      if (!clientPartner) {
        next(createError(404, "Deleted client partner not found"));
        return;
      }

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

      const clientPartner = await ClientPartner.findById(id);

      if (!clientPartner) {
        next(createError(404, "Client partner not found"));
        return;
      }

      // Find the employee
      const employeeIndex = clientPartner.employees.findIndex(
        (emp) => emp._id.toString() === employeeId && emp.isDeleted === true,
      );

      if (employeeIndex === -1) {
        next(createError(404, "Deleted employee not found"));
        return;
      }

      // Restore the employee by setting isDeleled flag to false
      clientPartner.employees[employeeIndex].isDeleted = false;

      await clientPartner.save();

      res.status(200).json({
        message: "Client partner employee restored successfully",
        cp: clientPartner,
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
