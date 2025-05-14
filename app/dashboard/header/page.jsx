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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select";

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
  
  const handleMenuItemAdd = (e) => {
    e.preventDefault();
    if (!menuItem.name || !menuItem.link) {
      setAlertType("error");
      setAlertMessage("Lütfen tüm alanları doldurun");
      setShowAlert(true);
      return;
    }
    
    dispatch(addMenuItem(menuItem));
    setMenuItem({
      name: "",
      link: "",
      type: "mainMenu"
    });
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
  
  // Menü öğelerini order alanına göre sıralama
  const sortedMainMenu = header?.mainMenu
    ? [...header.mainMenu].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];
    
  const sortedSocialLinks = header?.socialLinks
    ? [...header.socialLinks].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Header Yönetimi</h1>
      
      {showAlert && (
        <Alert className={`mb-4 ${alertType === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {alertType === "success" ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>{alertType === "success" ? "Başarılı" : "Hata"}</AlertTitle>
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="main-menu">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="main-menu">Ana Menü</TabsTrigger>
          <TabsTrigger value="social-links">Sosyal Bağlantılar</TabsTrigger>
          <TabsTrigger value="logo-settings">Logo Ayarları</TabsTrigger>
        </TabsList>
        
        <TabsContent value="main-menu">
          <Card>
            <CardHeader>
              <CardTitle>Ana Menü Yönetimi</CardTitle>
              <CardDescription>
                Sitenizin ana menü öğelerini buradan yönetebilirsiniz. Öğeleri sürükleyerek sıralayabilirsiniz.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Yeni Menü Öğesi Ekle</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Yeni Menü Öğesi</DialogTitle>
                      <DialogDescription>
                        Lütfen yeni menü öğesi bilgilerini girin.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleMenuItemAdd} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">İsim</Label>
                        <Input 
                          id="name" 
                          value={menuItem.name}
                          onChange={(e) => setMenuItem({...menuItem, name: e.target.value})}
                          placeholder="Menü öğesi adı" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="link">Bağlantı</Label>
                        <Input 
                          id="link" 
                          value={menuItem.link}
                          onChange={(e) => setMenuItem({...menuItem, link: e.target.value})}
                          placeholder="/sayfa-baglanti" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Menü Tipi</Label>
                        <Select 
                          value={menuItem.type}
                          onValueChange={(value) => setMenuItem({...menuItem, type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Menü tipini seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mainMenu">Ana Menü</SelectItem>
                            <SelectItem value="socialLinks">Sosyal Bağlantılar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full">Ekle</Button>
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
                    Henüz ana menü öğesi bulunmamaktadır.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="social-links">
          <Card>
            <CardHeader>
              <CardTitle>Sosyal Bağlantılar Yönetimi</CardTitle>
              <CardDescription>
                Sitenizin sosyal medya bağlantılarını buradan yönetebilirsiniz. Öğeleri sürükleyerek sıralayabilirsiniz.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Yeni Sosyal Bağlantı Ekle</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Yeni Sosyal Bağlantı</DialogTitle>
                      <DialogDescription>
                        Lütfen yeni sosyal bağlantı bilgilerini girin.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleMenuItemAdd} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Platform</Label>
                        <Input 
                          id="name" 
                          value={menuItem.name}
                          onChange={(e) => setMenuItem({...menuItem, name: e.target.value, type: "socialLinks"})}
                          placeholder="örn: Twitter" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="link">Bağlantı</Label>
                        <Input 
                          id="link" 
                          value={menuItem.link}
                          onChange={(e) => setMenuItem({...menuItem, link: e.target.value, type: "socialLinks"})}
                          placeholder="https://twitter.com/username" 
                        />
                      </div>
                      <input type="hidden" value="socialLinks" />
                      <Button type="submit" className="w-full">Ekle</Button>
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
                    Henüz sosyal bağlantı bulunmamaktadır.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logo-settings">
          <Card>
            <CardHeader>
              <CardTitle>Logo Ayarları</CardTitle>
              <CardDescription>
                Site logosunu ve logo metnini buradan değiştirebilirsiniz.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogoUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="logoText">Logo Metni</Label>
                    <Input 
                      id="logoText" 
                      value={formState.logoText}
                      onChange={(e) => setFormState({...formState, logoText: e.target.value})}
                      placeholder="Logo metni" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input 
                      id="logoUrl" 
                      value={formState.logoUrl}
                      onChange={(e) => setFormState({...formState, logoUrl: e.target.value})}
                      placeholder="/images/logo.png" 
                    />
                  </div>
                </div>
                <div className="mt-6">
                  {header?.logoUrl && (
                    <div className="mb-4">
                      <p className="mb-2 text-sm text-gray-500">Mevcut Logo:</p>
                      <img 
                        src={header.logoUrl} 
                        alt={header.logoText || "Logo"} 
                        className="h-12 object-contain border rounded p-2" 
                      />
                    </div>
                  )}
                  <Button type="submit" disabled={loading}>
                    {loading ? "Güncelleniyor..." : "Güncelle"}
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