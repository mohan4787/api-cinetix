class BaseService {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    try {
      const dataObj = new this.model(data);
      return await dataObj.save();
    } catch (exception) {
      throw exception;
    }
  }

  async getSingleRowByFilter(filter) {
    
    try {
      const data = await this.model.findOne(filter);
      // Uncomment if you want to populate createdBy/updatedBy
      // .populate("createdBy", ['_id', 'title', "email", "image", "role", "status"])
      // .populate("updatedBy", ['_id', 'title', "email", "image", "role", "status"])
      
      
      return data;
    } catch (exception) {
      throw exception;
    }
  }

  async findById(id) {
    try {
      return await this.model.findById(id);
    } catch (exception) {
      throw exception;
    }
  }

 
  async updateSingleRowByFilter(filter, data) {
    try {
      return await this.model.findOneAndUpdate(filter, { $set: data }, { new: true });
    } catch (exception) {
      throw exception;
    }
  }

  async updateById(id, data) {
    try {
      return await this.model.findByIdAndUpdate(id, { $set: data }, { new: true });
    } catch (exception) {
      throw exception;
    }
  }

  async deleteSingleRowByFilter(filter) {
    try {
      return await this.model.findOneAndDelete(filter);
    } catch (exception) {
      throw exception;
    }
  }


  async exists(filter) {
    try {
      return await this.model.exists(filter);
    } catch (exception) {
      throw exception;
    }
  }

  async getMultipleRowsByFilter(filter = {}, options = {}) {
    try {
      const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options;

      const data = await this.model.find(filter).populate("userId", "name email").populate("movieId", "title").sort(sort).skip(skip).limit(limit);

      const total = await this.model.countDocuments(filter);

      return {
        data,
        pagination: {
          total,
          limit,
          skip,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (exception) {
      throw exception;
    }
  }
  


  async count(filter = {}) {
    try {
      return await this.model.countDocuments(filter);
    } catch (exception) {
      throw exception;
    }
  }
}

module.exports = BaseService;