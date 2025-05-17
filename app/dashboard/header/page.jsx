"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getHeader, updateHeader, addMenuItem, removeMenuItem, reorderMenuItems } from "@/redux/actions/headerActions";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/app/_components/ui/alert";
import { AlertCircle, Check, Upload } from "lucide-react";
import { SortableList } from "@/app/_components/ui/sortable-list";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/app/_components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select";
import { uploadImageToCloudinary } from "../../../utils/cloudinary";

export default function HeaderPage() {
  const dispatch = useDispatch();
  const { header, loading, error, success, message } = useSelector((state) => state.header);
  
  const [formState, setFormState] = useState({
    logoText: "",
    logoUrl: "",
  });
  
  const [menuItem, setMenuItem] = useState({
    name: "",
    link: "",
    type: "mainMenu"
  });
  
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [socialDialogOpen, setSocialDialogOpen] = useState(false);
  
  useEffect(() => {
    dispatch(getHeader());
  }, [dispatch]);
  
  useEffect(() => {
    if (header) {
      setFormState({
        logoText: header.logoText || "",
        logoUrl: header.logoUrl || ""
      });
    }
  }, [header]);
  
  useEffect(() => {
    if (success && message) {
      setAlertType("success");
      setAlertMessage(message);
      setShowAlert(true);
      
      const timeout = setTimeout(() => {
        setShowAlert(false);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
    
    if (error) {
      setAlertType("error");
      setAlertMessage(error);
      setShowAlert(true);
      
      const timeout = setTimeout(() => {
        setShowAlert(false);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [success, error, message]);
  
  const handleLogoUpdate = (e) => {
    e.preventDefault();
    dispatch(updateHeader(formState));
  };
  
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setLogoUploading(true);
      const uploadedUrl = await uploadImageToCloudinary(file);
      
      setFormState({
        ...formState,
        logoUrl: uploadedUrl
      });
      
      setAlertType("success");
      setAlertMessage("Logo uploaded successfully");
      setShowAlert(true);
    } catch (error) {
      setAlertType("error");
      setAlertMessage(`Error uploading logo: ${error.message}`);
      setShowAlert(true);
    } finally {
      setLogoUploading(false);
    }
  };
  
  const handleMenuItemAdd = (e) => {
    e.preventDefault();
    if (!menuItem.name || !menuItem.link) {
      setAlertType("error");
      setAlertMessage("Please fill in all fields");
      setShowAlert(true);
      return;
    }
    
    dispatch(addMenuItem(menuItem));
    setMenuItem({
      name: "",
      link: "",
      type: "mainMenu"
    });
    
    // Close dialogs
    setMenuDialogOpen(false);
    setSocialDialogOpen(false);
  };
  
  const handleMenuItemDelete = (itemId, type) => {
    dispatch(removeMenuItem({ itemId, type }));
  };
  
  const handleMenuItemsReorder = (updatedItems, type) => {
    // Önce UI'da değişiklikleri uygula (optimistik güncelleme)
    if (type === 'mainMenu') {
      // Redux store'da shallow copy oluştur ve hemen UI'ı güncelle
      dispatch({
        type: 'header/optimisticUpdate',
        payload: {
          ...header,
          mainMenu: updatedItems
        }
      });
    } else if (type === 'socialLinks') {
      dispatch({
        type: 'header/optimisticUpdate',
        payload: {
          ...header,
          socialLinks: updatedItems
        }
      });
    }
    
    // Sonra API'ye gönder
    // Backend için uygun formata dönüştürme
    const items = updatedItems.map((item, index) => ({
      id: item._id,
      order: index
    }));
    
    // setTimeout ekleyerek UI'ın önce güncellenmesini sağlıyoruz
    setTimeout(() => {
      dispatch(reorderMenuItems({ items, type }));
    }, 10);
  };
  
  // Sort menu items by order field
  const sortedMainMenu = header?.mainMenu
    ? [...header.mainMenu].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];
    
  const sortedSocialLinks = header?.socialLinks
    ? [...header.socialLinks].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Header Management</h1>
      
      {showAlert && (
        <Alert className={`mb-4 ${alertType === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {alertType === "success" ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>{alertType === "success" ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="main-menu">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="main-menu">Main Menu</TabsTrigger>
          <TabsTrigger value="social-links">Social Links</TabsTrigger>
          <TabsTrigger value="logo-settings">Logo Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="main-menu">
          <Card>
            <CardHeader>
              <CardTitle>Main Menu Management</CardTitle>
              <CardDescription>
                Manage your site's main menu items here. You can drag items to reorder them.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Add New Menu Item</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>New Menu Item</DialogTitle>
                      <DialogDescription>
                        Please enter information for the new menu item.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleMenuItemAdd} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input 
                          id="name" 
                          value={menuItem.name}
                          onChange={(e) => setMenuItem({...menuItem, name: e.target.value})}
                          placeholder="Menu item name" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="link">Link</Label>
                        <Input 
                          id="link" 
                          value={menuItem.link}
                          onChange={(e) => setMenuItem({...menuItem, link: e.target.value})}
                          placeholder="/page-link" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Menu Type</Label>
                        <Select 
                          value={menuItem.type}
                          onValueChange={(value) => setMenuItem({...menuItem, type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select menu type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mainMenu">Main Menu</SelectItem>
                            <SelectItem value="socialLinks">Social Links</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full">Add</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="mt-4">
                {sortedMainMenu.length > 0 ? (
                  <SortableList
                    items={sortedMainMenu}
                    onChange={(updatedItems) => handleMenuItemsReorder(updatedItems, 'mainMenu')}
                    onDelete={(itemId) => handleMenuItemDelete(itemId, 'mainMenu')}
                    renderItem={(item) => (
                      <div className="flex justify-between items-center w-full px-2">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-gray-500 text-sm">{item.link}</div>
                      </div>
                    )}
                  />
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No main menu items yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="social-links">
          <Card>
            <CardHeader>
              <CardTitle>Social Links Management</CardTitle>
              <CardDescription>
                Manage your site's social media links here. You can drag items to reorder them.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Dialog open={socialDialogOpen} onOpenChange={setSocialDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Add New Social Link</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>New Social Link</DialogTitle>
                      <DialogDescription>
                        Please enter information for the new social link.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleMenuItemAdd} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Platform</Label>
                        <Input 
                          id="name" 
                          value={menuItem.name}
                          onChange={(e) => setMenuItem({...menuItem, name: e.target.value, type: "socialLinks"})}
                          placeholder="e.g., Twitter" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="link">Link</Label>
                        <Input 
                          id="link" 
                          value={menuItem.link}
                          onChange={(e) => setMenuItem({...menuItem, link: e.target.value, type: "socialLinks"})}
                          placeholder="https://twitter.com/username" 
                        />
                      </div>
                      <input type="hidden" value="socialLinks" />
                      <Button type="submit" className="w-full">Add</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="mt-4">
                {sortedSocialLinks.length > 0 ? (
                  <SortableList
                    items={sortedSocialLinks}
                    onChange={(updatedItems) => handleMenuItemsReorder(updatedItems, 'socialLinks')}
                    onDelete={(itemId) => handleMenuItemDelete(itemId, 'socialLinks')}
                    renderItem={(item) => (
                      <div className="flex justify-between items-center w-full px-2">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-gray-500 text-sm">{item.link}</div>
                      </div>
                    )}
                  />
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No social links yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logo-settings">
          <Card>
            <CardHeader>
              <CardTitle>Logo Settings</CardTitle>
              <CardDescription>
                Change your site logo and logo text here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogoUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="logoText">Logo Text</Label>
                    <Input 
                      id="logoText" 
                      value={formState.logoText}
                      onChange={(e) => setFormState({...formState, logoText: e.target.value})}
                      placeholder="Logo text" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="logoUrl" 
                        value={formState.logoUrl}
                        onChange={(e) => setFormState({...formState, logoUrl: e.target.value})}
                        placeholder="/images/logo.png" 
                        className="flex-1"
                      />
                      <div className="relative">
                        <Input
                          type="file"
                          id="logoFile"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          disabled={logoUploading}
                          className="relative"
                        >
                          {logoUploading ? (
                            "Uploading..."
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter a URL or upload a file. When you upload a file, the URL will be updated automatically.
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  {formState.logoUrl && (
                    <div className="mb-4">
                      <p className="mb-2 text-sm text-gray-500">Preview:</p>
                      <img 
                        src={formState.logoUrl} 
                        alt={formState.logoText || "Logo"} 
                        className="h-12 object-contain border rounded p-2" 
                      />
                    </div>
                  )}
                  <Button type="submit" disabled={loading || logoUploading}>
                    {loading ? "Updating..." : "Update"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 