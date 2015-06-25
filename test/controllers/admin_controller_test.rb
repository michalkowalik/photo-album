require 'test_helper'

class AdminControllerTest < ActionController::TestCase
  test "should get folders" do
    get :folders
    assert_response :success
  end

  test "should get index" do
    get :index
    assert_response :success
  end

  test "should get update" do
    get :update
    assert_response :success
  end

end
