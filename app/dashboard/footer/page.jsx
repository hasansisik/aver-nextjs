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
      setAlertMessage("Lütfen tüm alanları doldurun");
      setShowAlert(true);
      return;
    }
    
    dispatch(addMenuItem(menuItem));
    setMenuItem({
      name: "",
      link: "",
      type: "footerMenu"
    });
  };
  
  const handleMenuItemDelete = (itemId, type) => {
    dispatch(removeMenuItem({ itemId, type }));
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
      <h1 className="text-3xl font-bold mb-6">Footer Yönetimi</h1>
      
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
      
      <Tabs defaultValue="footer-menu">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="footer-menu">Footer Menüsü</TabsTrigger>
          <TabsTrigger value="social-links">Sosyal Bağlantılar</TabsTrigger>
          <TabsTrigger value="general-settings">Genel Ayarlar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="footer-menu">
          <Card>
            <CardHeader>
              <CardTitle>Footer Menü Yönetimi</CardTitle>
              <CardDescription>
                Footer menü öğelerini buradan yönetebilirsiniz. Öğeleri sürükleyerek sıralayabilirsiniz.
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
                            <SelectItem value="footerMenu">Footer Menü</SelectItem>
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
                {sortedFooterMenu.length > 0 ? (
                  <SortableList
                    items={sortedFooterMenu}
                    onChange={(updatedItems) => handleMenuItemsReorder(updatedItems, 'footerMenu')}
                    onDelete={(itemId) => handleMenuItemDelete(itemId, 'footerMenu')}
                    renderItem={(item) => (
                      <div className="flex justify-between items-center w-full px-2">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-gray-500 text-sm">{item.link}</div>
                      </div>
                    )}
                  />
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    Henüz footer menü öğesi bulunmamaktadır.
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
        
        <TabsContent value="general-settings">
          <Card>
            <CardHeader>
              <CardTitle>Genel Ayarlar</CardTitle>
              <CardDescription>
                Footer için genel ayarları buradan düzenleyebilirsiniz.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFooterUpdate}>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ctaText">CTA Metni</Label>
                    <Input 
                      id="ctaText" 
                      value={formState.ctaText}
                      onChange={(e) => setFormState({...formState, ctaText: e.target.value})}
                      placeholder="Let's make something" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctaLink">CTA Bağlantısı</Label>
                    <Input 
                      id="ctaLink" 
                      value={formState.ctaLink}
                      onChange={(e) => setFormState({...formState, ctaLink: e.target.value})}
                      placeholder="/contact" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="copyright">Telif Hakkı Metni</Label>
                    <Input 
                      id="copyright" 
                      value={formState.copyright}
                      onChange={(e) => setFormState({...formState, copyright: e.target.value})}
                      placeholder="© 2023 Aver. All rights reserved." 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="developerInfo">Geliştirici Bilgisi</Label>
                    <Input 
                      id="developerInfo" 
                      value={formState.developerInfo}
                      onChange={(e) => setFormState({...formState, developerInfo: e.target.value})}
                      placeholder="Geliştirici bilgisi" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="developerLink">Geliştirici Bağlantısı</Label>
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