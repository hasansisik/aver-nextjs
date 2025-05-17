"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFooter, updateFooter, addMenuItem, removeMenuItem, reorderMenuItems } from "@/redux/actions/footerActions";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/app/_components/ui/alert";
import { AlertCircle, Check } from "lucide-react";
import { SortableList } from "@/app/_components/ui/sortable-list";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/app/_components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/_components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select";

export default function FooterPage() {
  const dispatch = useDispatch();
  const { footer, loading, error, success, message } = useSelector((state) => state.footer);
  
  const [formState, setFormState] = useState({
    ctaText: "",
    ctaLink: "",
    copyright: "",
    developerInfo: "",
    developerLink: ""
  });
  
  const [menuItem, setMenuItem] = useState({
    name: "",
    link: "",
    type: "footerMenu"
  });
  
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [socialDialogOpen, setSocialDialogOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemTypeToDelete, setItemTypeToDelete] = useState(null);
  
  useEffect(() => {
    dispatch(getFooter());
  }, [dispatch]);
  
  useEffect(() => {
    if (footer) {
      setFormState({
        ctaText: footer.ctaText || "",
        ctaLink: footer.ctaLink || "",
        copyright: footer.copyright || "",
        developerInfo: footer.developerInfo || "",
        developerLink: footer.developerLink || ""
      });
    }
  }, [footer]);
  
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
  
  const handleFooterUpdate = (e) => {
    e.preventDefault();
    dispatch(updateFooter(formState));
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
      type: "footerMenu"
    });
    
    // Close dialogs
    setMenuDialogOpen(false);
    setSocialDialogOpen(false);
  };
  
  const confirmDeleteMenuItem = (itemId, type) => {
    setItemToDelete(itemId);
    setItemTypeToDelete(type);
    setDeleteAlertOpen(true);
  };
  
  const handleMenuItemDelete = () => {
    if (itemToDelete && itemTypeToDelete) {
      dispatch(removeMenuItem({ itemId: itemToDelete, type: itemTypeToDelete }));
      setItemToDelete(null);
      setItemTypeToDelete(null);
    }
  };
  
  const handleMenuItemsReorder = (updatedItems, type) => {
    // Önce UI'da değişiklikleri uygula (optimistik güncelleme)
    if (type === 'footerMenu') {
      // Redux store'da shallow copy oluştur ve hemen UI'ı güncelle
      dispatch({
        type: 'footer/optimisticUpdate',
        payload: {
          ...footer,
          footerMenu: updatedItems
        }
      });
    } else if (type === 'socialLinks') {
      dispatch({
        type: 'footer/optimisticUpdate',
        payload: {
          ...footer,
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
  
  // Menü öğelerini order alanına göre sıralama
  const sortedFooterMenu = footer?.footerMenu
    ? [...footer.footerMenu].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];
    
  const sortedSocialLinks = footer?.socialLinks
    ? [...footer.socialLinks].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Footer Management</h1>
      
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
      
      <Tabs defaultValue="footer-menu">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="footer-menu">Footer Menu</TabsTrigger>
          <TabsTrigger value="social-links">Social Links</TabsTrigger>
          <TabsTrigger value="general-settings">General Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="footer-menu">
          <Card>
            <CardHeader>
              <CardTitle>Footer Menu Management</CardTitle>
              <CardDescription>
                Manage footer menu items here. You can drag items to reorder them.
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
                            <SelectItem value="footerMenu">Footer Menu</SelectItem>
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
                {sortedFooterMenu.length > 0 ? (
                  <SortableList
                    items={sortedFooterMenu}
                    onChange={(updatedItems) => handleMenuItemsReorder(updatedItems, 'footerMenu')}
                    onDelete={(itemId) => confirmDeleteMenuItem(itemId, 'footerMenu')}
                    renderItem={(item) => (
                      <div className="flex justify-between items-center w-full px-2">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-gray-500 text-sm">{item.link}</div>
                      </div>
                    )}
                  />
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No footer menu items yet.
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
                    onDelete={(itemId) => confirmDeleteMenuItem(itemId, 'socialLinks')}
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
        
        <TabsContent value="general-settings">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Edit general settings for the footer here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFooterUpdate}>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ctaText">CTA Text</Label>
                    <Input 
                      id="ctaText" 
                      value={formState.ctaText}
                      onChange={(e) => setFormState({...formState, ctaText: e.target.value})}
                      placeholder="Let's make something" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctaLink">CTA Link</Label>
                    <Input 
                      id="ctaLink" 
                      value={formState.ctaLink}
                      onChange={(e) => setFormState({...formState, ctaLink: e.target.value})}
                      placeholder="/contact" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="copyright">Copyright Text</Label>
                    <Input 
                      id="copyright" 
                      value={formState.copyright}
                      onChange={(e) => setFormState({...formState, copyright: e.target.value})}
                      placeholder="© 2023 Aver. All rights reserved." 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="developerInfo">Developer Info</Label>
                    <Input 
                      id="developerInfo" 
                      value={formState.developerInfo}
                      onChange={(e) => setFormState({...formState, developerInfo: e.target.value})}
                      placeholder="Developer information" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="developerLink">Developer Link</Label>
                    <Input 
                      id="developerLink" 
                      value={formState.developerLink}
                      onChange={(e) => setFormState({...formState, developerLink: e.target.value})}
                      placeholder="https://github.com/username" 
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this {itemTypeToDelete === 'footerMenu' ? 'menu item' : 'social link'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The item will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { 
              setItemToDelete(null);
              setItemTypeToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleMenuItemDelete} className="bg-red-600 focus:ring-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 