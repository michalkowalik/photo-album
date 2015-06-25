class AddCoverToFolders < ActiveRecord::Migration
  def change
    add_column :folders, :cover, :integer
  end
end
