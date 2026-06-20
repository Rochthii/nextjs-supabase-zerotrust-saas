'use client';

import React, { useTransition } from 'react';
import { updateSettings } from '@/app/actions/admin/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChangePasswordForm } from '@/components/admin/change-password-form';
import { LogoSettingField } from '@/components/admin/logo-setting-field';
import { toast } from 'sonner';
import { DEFAULT_SITE_NAME } from '@/lib/constants';

export function SettingsForm({ initialSettings, contextTenantId, isCompany }: { initialSettings: Record<string, string>, contextTenantId: string, isCompany?: boolean }) {
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.append('tenant_id', contextTenantId);

        startTransition(async () => {
            try {
                const result = await updateSettings(formData);
                if (result?.error) {
                    toast.error(result.error);
                } else {
                    toast.success('Save settings successfully!');
                }
            } catch (error: any) {
                toast.error(error.message || 'An unknown error occurred.');
            }
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-6">
                {/* Site Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>{isCompany ? 'Organization Information' : 'Branch Information'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <LogoSettingField defaultValue={initialSettings['site_logo'] || ''} />

                        <div className="pt-4 border-t">
                            <Label htmlFor="site_name_vi">{isCompany ? 'Organization Name (VI)' : 'Branch Name (VI)'}</Label>
                            <Input
                                id="site_name_vi"
                                name="site_name_vi"
                                defaultValue={initialSettings['site_name_vi'] || DEFAULT_SITE_NAME}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="site_name_en">{isCompany ? 'Organization Name (EN)' : 'Branch Name (EN)'}</Label>
                            <Input
                                id="site_name_en"
                                name="site_name_en"
                                defaultValue={initialSettings['site_name_en'] || DEFAULT_SITE_NAME}
                            />
                        </div>

                        <div>
                            <Label htmlFor="site_name_km">{isCompany ? 'Organization Name (KM)' : 'Branch Name (KM)'}</Label>
                            <Input
                                id="site_name_km"
                                name="site_name_km"
                                defaultValue={initialSettings['site_name_km'] || ''}
                            />
                        </div>

                        <div>
                            <Label htmlFor="site_subtitle_vi">{isCompany ? 'Subtitle (e.g. Social Enterprise)' : 'Subtitle (e.g. Khmer Branch)'}</Label>
                            <Input
                                id="site_subtitle_vi"
                                name="site_subtitle_vi"
                                defaultValue={initialSettings['site_subtitle_vi'] || (isCompany ? 'Social Enterprise' : 'Khmer Branch')}
                            />
                        </div>

                        <div>
                            <Label htmlFor="site_description">Short Description</Label>
                            <Textarea
                                id="site_description"
                                name="site_description"
                                defaultValue={initialSettings['site_description'] || ''}
                                rows={3}
                                placeholder={isCompany ? "Short description of the organization..." : "Short description of the branch..."}
                            />
                        </div>

                        <div className="pt-4 border-t">
                            <Label htmlFor="site_og_image">Social Sharing Image (Social OG Image URL)</Label>
                            <Input
                                id="site_og_image"
                                name="site_og_image"
                                defaultValue={initialSettings['site_og_image'] || ''}
                                placeholder="https://.../og-image.jpg"
                            />
                            <p className="text-xs text-gray-500 mt-1">This image will appear when sharing the link via Facebook, Zalo, Telegram... (Recommended size: 1200x630px)</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Bank Information (New) - Only for Global Company */}
                {isCompany && (
                <Card>
                    <CardHeader>
                        <CardTitle>Bank Information (VietQR)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="bank_name">Bank Name</Label>
                                <Input
                                    id="bank_name"
                                    name="bank.name"
                                    defaultValue={initialSettings['bank.name'] || ''}
                                    placeholder="Bank ACB"
                                />
                            </div>
                            <div>
                                <Label htmlFor="bank_id">System Code (Bin ID)</Label>
                                <Input
                                    id="bank_id"
                                    name="bank.id"
                                    defaultValue={initialSettings['bank.id'] || ''}
                                    placeholder="e.g. 970416 (ACB)"
                                />
                                <p className="text-xs text-gray-500 mt-1">Lookup at vietqr.io (e.g. VCB=970436, ACB=970416)</p>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="bank_account_no">Account Number</Label>
                            <Input
                                id="bank_account_no"
                                name="bank.account_no"
                                defaultValue={initialSettings['bank.account_no'] || ''}
                                placeholder="0123456789"
                            />
                        </div>

                        <div>
                            <Label htmlFor="bank_account_name">Account Holder Name (ALL CAPS, no accents)</Label>
                            <Input
                                id="bank_account_name"
                                name="bank.account_name"
                                defaultValue={initialSettings['bank.account_name'] || ''}
                                placeholder={isCompany ? "ORGANIZATION NAME" : "MULTI-TENANT ECOSYSTEM"}
                            />
                        </div>

                        <div>
                            <Label htmlFor="bank_qr_template">QR Template</Label>
                            <select
                                id="bank_qr_template"
                                name="bank.qr_template"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                defaultValue={initialSettings['bank.qr_template'] || 'compact2'}
                            >
                                <option value="compact">Compact (Simple)</option>
                                <option value="compact2">Compact 2 (Premium)</option>
                                <option value="qr_only">QR Only</option>
                                <option value="print">Print (For printing)</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>
                )}

                {/* Contact Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="contact_email">Email</Label>
                            <Input
                                id="contact_email"
                                name="contact_email"
                                type="email"
                                defaultValue={initialSettings['contact_email'] || ''}
                                placeholder="contact@system.com"
                            />
                        </div>

                        <div>
                            <Label htmlFor="contact_phone">Phone Number</Label>
                            <Input
                                id="contact_phone"
                                name="contact_phone"
                                defaultValue={initialSettings['contact_phone'] || ''}
                                placeholder="+84 xxx xxx xxx"
                            />
                        </div>

                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                name="address"
                                defaultValue={initialSettings['address'] || ''}
                                rows={3}
                                placeholder="Full address..."
                            />
                        </div>

                        <div>
                            <Label htmlFor="map_embed_url">Google Maps Embed URL (iframe src)</Label>
                            <Input
                                id="map_embed_url"
                                name="map_embed_url"
                                defaultValue={initialSettings['map_embed_url'] || ''}
                                placeholder="https://www.google.com/maps/embed?pb=..."
                            />
                            <p className="text-xs text-gray-500 mt-1">Get the src link inside the Google Maps embed iframe (Share &gt; Embed map)</p>
                        </div>

                        <div>
                            <Label htmlFor="map_direction_url">Google Maps Directions Link</Label>
                            <Input
                                id="map_direction_url"
                                name="map_direction_url"
                                defaultValue={initialSettings['map_direction_url'] || ''}
                                placeholder="https://maps.app.goo.gl/..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Social Media */}
                <Card>
                    <CardHeader>
                        <CardTitle>Social Media</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="facebook_url">Facebook</Label>
                            <Input
                                id="facebook_url"
                                name="facebook_url"
                                type="url"
                                defaultValue={initialSettings['facebook_url'] || ''}
                                placeholder="https://facebook.com/..."
                            />
                        </div>

                        <div>
                            <Label htmlFor="youtube_url">YouTube</Label>
                            <Input
                                id="youtube_url"
                                name="youtube_url"
                                type="url"
                                defaultValue={initialSettings['youtube_url'] || ''}
                                placeholder="https://youtube.com/..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Change Password */}
                <ChangePasswordForm />

                {/* Save Button */}
                <div className="flex gap-4">
                    <Button type="submit" disabled={isPending} className="bg-gold-primary hover:bg-gold-dark text-white">
                        {isPending ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
