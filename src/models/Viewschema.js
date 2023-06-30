// Create a project schema
const projectSchema = new mongoose.Schema({
    name: String,
    description: String,
  });
  
  // Create a project model
  const Project = mongoose.model('Project', projectSchema);