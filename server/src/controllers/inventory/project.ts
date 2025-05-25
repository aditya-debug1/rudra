import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { Floor, Project, Unit, Wing } from "../../models/inventory"; // Adjust path as needed
import auditService from "../../utils/audit-service";
import createError from "../../utils/createError";

type UnitPayload = {
  unitNumber: string;
  area: number;
  configuration: string;
  unitSpan: number;
  status: string;
  reservedByOrReason?: string;
  referenceId?: string;
};

type FloorPayload = {
  type: "residential" | "commercial";
  displayNumber: number;
  showArea: boolean;
  units: UnitPayload[];
};

type WingPayload = {
  name: string;
  floors: FloorPayload[];
  commercialFloors?: FloorPayload[];
  unitsPerFloor: number;
  headerFloorIndex: number;
};

type ProjectPayload = {
  name: string;
  by: string;
  location: string;
  description?: string;
  startDate: Date | string;
  completionDate?: Date | string;
  status: "planning" | "under-construction" | "completed";
  commercialUnitPlacement: "projectLevel" | "wingLevel";
  wings: WingPayload[];
  commercialFloors?: FloorPayload[];
};

class ProjectController {
  /**
   * Creates a new project with all associated wings, floors, and units
   */
  async createProject(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const projectData: ProjectPayload = req.body;

      // Create the project first
      const project = new Project({
        name: projectData.name,
        by: projectData.by,
        location: projectData.location,
        startDate: new Date(projectData.startDate),
        status: projectData.status,
        commercialUnitPlacement: projectData.commercialUnitPlacement,
        wings: [], // Will populate these later
        commercialFloors: [], // Will populate these later
      });

      if (projectData.description) {
        project.description = projectData.description;
      }

      if (projectData.completionDate) {
        project.completionDate = new Date(projectData.completionDate);
      }

      await project.save();

      // Process wings
      for (const wingData of projectData.wings) {
        const wing = new Wing({
          projectId: project._id,
          name: wingData.name,
          unitsPerFloor: wingData.unitsPerFloor,
          headerFloorIndex: wingData.headerFloorIndex,
          floors: [], // Will populate these later
          commercialFloors: [], // Will populate these later
        });

        await wing.save();

        // Add wing to project
        project.wings.push(wing._id);

        // Process residential floors in wing
        for (const floorData of wingData.floors) {
          const floor = new Floor({
            wingId: wing._id,
            projectId: project._id,
            type: floorData.type,
            displayNumber: floorData.displayNumber,
            showArea: floorData.showArea,
            units: [], // Will populate these later
          });

          await floor.save();

          // Add floor to wing
          wing.floors.push(floor._id);

          // Process units in floor
          for (const unitData of floorData.units) {
            const unit = new Unit({
              floorId: floor._id,
              unitNumber: unitData.unitNumber,
              area: unitData.area,
              configuration: unitData.configuration,
              unitSpan: unitData.unitSpan,
              status: unitData.status,
              reservedByOrReason: unitData.reservedByOrReason,
              referenceId: unitData.referenceId,
            });

            await unit.save();

            // Add unit to floor
            floor.units.push(unit._id);
          }

          await floor.save();
        }

        // Process commercial floors in wing (if commercialUnitPlacement is wingLevel)
        if (
          projectData.commercialUnitPlacement === "wingLevel" &&
          wingData.commercialFloors
        ) {
          for (const floorData of wingData.commercialFloors) {
            const floor = new Floor({
              wingId: wing._id,
              projectId: project._id,
              type: floorData.type,
              displayNumber: floorData.displayNumber,
              showArea: floorData.showArea,
              units: [], // Will populate these later
            });

            await floor.save();

            // Add commercial floor to wing
            wing.commercialFloors!.push(floor._id);

            // Process units in commercial floor
            for (const unitData of floorData.units) {
              const unit = new Unit({
                floorId: floor._id,
                unitNumber: unitData.unitNumber,
                area: unitData.area,
                configuration: unitData.configuration,
                unitSpan: unitData.unitSpan,
                status: unitData.status,
                reservedByOrReason: unitData.reservedByOrReason,
                referenceId: unitData.referenceId,
              });

              await unit.save();

              // Add unit to floor
              floor.units.push(unit._id);
            }

            await floor.save();
          }
        }

        await wing.save();
      }

      // Process project-level commercial floors (if commercialUnitPlacement is projectLevel)
      if (
        projectData.commercialUnitPlacement === "projectLevel" &&
        projectData.commercialFloors
      ) {
        for (const floorData of projectData.commercialFloors) {
          const floor = new Floor({
            projectId: project._id,
            type: floorData.type,
            displayNumber: floorData.displayNumber,
            showArea: floorData.showArea,
            units: [], // Will populate these later
          });

          await floor.save();

          // Add commercial floor to project
          project.commercialFloors!.push(floor._id);

          // Process units in commercial floor
          for (const unitData of floorData.units) {
            const unit = new Unit({
              floorId: floor._id,
              unitNumber: unitData.unitNumber,
              area: unitData.area,
              configuration: unitData.configuration,
              unitSpan: unitData.unitSpan,
              status: unitData.status,
              reservedByOrReason: unitData.reservedByOrReason,
              referenceId: unitData.referenceId,
            });

            await unit.save();

            // Add unit to floor
            floor.units.push(unit._id);
          }

          await floor.save();
        }
      }

      await project.save();

      // Create audit log
      await auditService.logCreate(
        project.toObject(),
        req,
        "Inventory",
        `Created project: ${project.name}`,
      );

      res.status(201).json({
        success: true,
        data: {
          projectId: project._id,
          message: "Project created successfully",
        },
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Failed to create project",
        ),
      );
    }
  }

  /**
   * Get all projects and all its related data (wings, floors, units)
   * And sends it in a structure for table
   * Sends Name, By, StartDate, Status, Total wings, Total units, Total commercial units
   */
  async getAllProjects(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Get pagination parameters from query string with defaults
      const page = parseInt(req.query.page as string) || 1; // Default to page 1
      const limit = parseInt(req.query.limit as string) || 10; // Default to 10 items per page
      const search = req.query.search as string;

      // Build query object for filtering
      const query: any = {};

      // Add search functionality if search parameter is provided
      if (search) {
        const searchTerms = search.trim().split(/\s+/);
        if (searchTerms.length > 0) {
          // Create $and array to match multiple search terms
          query.$and = searchTerms.map((term) => {
            return {
              $or: [
                { name: { $regex: term, $options: "i" } }, // Case-insensitive search on name
                { by: { $regex: term, $options: "i" } }, // Case-insensitive search on 'by' field
                { status: { $regex: term, $options: "i" } }, // Case-insensitive search on status
              ],
            };
          });
        }
      }

      // Calculate the skip value for pagination
      const skip = (page - 1) * limit;

      // Get the total count of projects matching the search criteria
      const totalProjects = await Project.countDocuments(query);

      // Calculate total pages
      const totalPages = Math.ceil(totalProjects / limit);

      // Fetch paginated projects with search filter
      const projects = await Project.find(query).skip(skip).limit(limit);

      // Prepare data for response with additional counts
      const projectsData = await Promise.all(
        projects.map(async (project) => {
          // Count wings
          const totalWings = project.wings.length;

          // Find all floors for this project
          const floors = await Floor.find({ projectId: project._id });

          // Count total units and commercial units
          let totalUnits = 0;
          let totalAvailableUnits = 0;
          let totalCommercialUnits = 0;
          let totalAvailableCommercialUnits = 0;

          // Get all floor IDs
          const floorIds = floors.map((floor) => floor._id);

          // Fetch all units for all floors in one query
          const allUnits = await Unit.find({ floorId: { $in: floorIds } });

          // Process units in memory
          for (const floor of floors) {
            const floorUnits = allUnits.filter(
              (unit) =>
                unit.floorId.equals(floor._id) && unit.status !== "others",
            );
            const availableUnits = floorUnits.filter(
              (unit) => unit.status === "available",
            );
            if (floor.type === "commercial") {
              totalCommercialUnits += floorUnits.length;
              totalAvailableCommercialUnits += availableUnits.length;
            } else if (floor.type === "residential") {
              totalUnits += floorUnits.length;
              totalAvailableUnits += availableUnits.length;
            }
          }
          return {
            _id: project._id,
            name: project.name,
            by: project.by,
            startDate: project.startDate,
            status: project.status,
            totalWings,
            totalUnits,
            totalAvailableUnits,
            totalCommercialUnits,
            totalAvailableCommercialUnits,
          };
        }),
      );

      // Send response with pagination data
      res.status(200).json({
        success: true,
        pagination: {
          totalProjects,
          totalPages,
          currentPage: page,
          limitNumber: limit,
          search: search || null, // Include search term in the response
        },
        count: projectsData.length,
        data: projectsData,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Failed to fetch projects",
        ),
      );
    }
  }

  async getProjectsStructure(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // fetch all projects
      const projects = await Project.find(
        {},
        "_id name by location commercialUnitPlacement",
      )
        .populate({
          path: "wings",
          select: "_id name unitsPerFloor headerFloorIndex",
          populate: [
            {
              path: "floors",
              select: "_id type displayNumber showArea",
              populate: {
                path: "units",
                select:
                  "_id unitNumber area configuration unitSpan status reservedByOrReason referenceId",
              },
            },
            {
              path: "commercialFloors",
              select: "_id type displayNumber showArea",
              populate: {
                path: "units",
                select:
                  "_id unitNumber area configuration unitSpan status reservedByOrReason referenceId",
              },
            },
          ],
        })
        .populate({
          path: "commercialFloors",
          select: "_id type displayNumber showArea",
          populate: {
            path: "units",
            select:
              "_id unitNumber area configuration unitSpan status reservedByOrReason referenceId",
          },
        });

      res.status(200).json({
        success: true,
        data: projects,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error
            ? error.message
            : "Failed to fetch projects structure",
        ),
      );
    }
  }

  /**
   * Gets a project by ID with all its related data (wings, floors, units)
   */
  async getProjectById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { projectId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return next(createError(400, "Invalid project ID"));
      }

      const project = await Project.findById(projectId)
        .populate({
          path: "wings",
          populate: [
            {
              path: "floors",
              populate: {
                path: "units",
              },
            },
            {
              path: "commercialFloors",
              populate: {
                path: "units",
              },
            },
          ],
        })
        .populate({
          path: "commercialFloors",
          populate: {
            path: "units",
          },
        });

      if (!project) {
        return next(createError(404, "Project not found"));
      }

      res.status(200).json({
        success: true,
        data: project,
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Failed to fetch project",
        ),
      );
    }
  }

  /**
   * Updates a project's basic information
   */
  async updateProject(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { projectId } = req.params;
      const projectData: Partial<ProjectPayload> = req.body;

      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return next(createError(400, "Invalid project ID"));
      }

      // Get original project data for audit comparison
      const originalProject = await Project.findById(projectId).lean();
      if (!originalProject) {
        return next(createError(404, "Project not found"));
      }

      // Update project's direct properties
      const updateData: Partial<ProjectPayload> = {};
      if (projectData.name) updateData.name = projectData.name;
      if (projectData.by) updateData.by = projectData.by;
      if (projectData.location) updateData.location = projectData.location;
      if (projectData.description)
        updateData.description = projectData.description;
      if (projectData.startDate)
        updateData.startDate = new Date(projectData.startDate);
      if (projectData.completionDate)
        updateData.completionDate = new Date(projectData.completionDate);
      if (projectData.status) updateData.status = projectData.status;

      const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        updateData,
        { new: true },
      );

      if (!updatedProject) {
        createError(500, "Failed to update project unkonwn error occured");
      }

      // Create audit log
      await auditService.logUpdate(
        originalProject,
        updatedProject,
        req,
        "Inventory",
        `Updated project: ${originalProject.name}`,
      );

      res.status(200).json({
        success: true,
        data: {
          projectId: updatedProject!._id,
          message: "Project updated successfully",
        },
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Failed to update project",
        ),
      );
    }
  }

  /**
   * Deletes a project and all related entities
   */
  async deleteProject(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { projectId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return next(createError(400, "Invalid project ID"));
      }

      const project = await Project.findById(projectId);

      if (!project) {
        return next(createError(404, "Project not found"));
      }

      // Get project data for audit log before deletion
      const projectToDelete = project.toObject();

      // Delete all units in all floors
      const floors = await Floor.find({ projectId });
      for (const floor of floors) {
        await Unit.deleteMany({ floorId: floor._id });
      }

      // Delete all floors
      await Floor.deleteMany({ projectId });

      // Delete all wings
      await Wing.deleteMany({ projectId });

      // Finally delete the project
      await Project.findByIdAndDelete(projectId);

      // Create audit log
      await auditService.logDelete(
        projectToDelete,
        req,
        "Inventory",
        `Deleted project: ${project.name}`,
      );

      res.status(200).json({
        success: true,
        message: "Project and all related entities deleted successfully",
      });
    } catch (error) {
      next(
        createError(
          500,
          error instanceof Error ? error.message : "Failed to delete project",
        ),
      );
    }
  }
}

export const projectController = new ProjectController();
