class BaseRepo {
  static instances = new Map();

  constructor(model) {
    if (BaseRepo.instances.has(model)) {
      return BaseRepo.instances.get(model);
    }

    this.model = model;
    BaseRepo.instances.set(model, this);
  }

  async create(data) {
    try {
      const created = await this.model.create({ data });
      return created;
    } catch (error) {
      throw new Error(`Error occurred while creating: ${error}`);
    }
  }

  async get(where) {
    try {
      const fetched = await this.model.findUnique({ where });
      return fetched;
    } catch (error) {
      throw new Error(`Error occurred while fetching: ${error}`);
    }
  }

  async find(id, limit, skipIndex) {
    try {
      const [fetched, totalCount] = await Promise.all([
        this.model.findMany({
          where: { userId: id },
          skip: skipIndex,
          take: limit,
          orderBy: { createdAt: 'desc' },

          include: {
            user: {
              select: { email: true },
            },
          },
        }),

        this.model.count({
          where: { userId: id },
        }),
      ]);

      return { totalCount, fetched };
    } catch (error) {
      throw new Error(`Error occurred while fetching user content: ${error}`);
    }
  }

  async update(where, data) {
    try {
      const updated = await this.model.update({ where, data });
      return updated;
    } catch (error) {
      throw new Error(`Error occurred while updating: ${error}`);
    }
  }

  async delete(where) {
    try {
      const deleted = await this.model.delete({ where });
      return deleted;
    } catch (error) {
      throw new Error(`Error occurred while deleting: ${error}`);
    }
  }

  async findMany(where = {}) {
    try {
      const results = await this.model.findMany({ where });
      return results;
    } catch (error) {
      throw new Error(`Error occurred while fetching many: ${error}`);
    }
  }
}

export default BaseRepo;
