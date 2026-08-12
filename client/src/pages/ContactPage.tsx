// FILE: client/src/pages/ContactPage.tsx
import { useState, type FormEvent } from 'react'
import {
  Copy,
  Check,
  Mail,
  MessageSquare,
  MapPin,
  Phone,
  Send,
  Github,
  Linkedin,
  Instagram,
} from 'lucide-react'
import { SEO } from '@/components/SEO'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { Section, Container } from '@/components/Section'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/State'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/contexts/ToastContext'
import { useFetch } from '@/hooks/useFetch'
import { sendEmail, EMAILJS_CONFIGURED } from '@/services/email'
import type { Profile, SiteConfig } from '@/types'

interface FormState {
  name: string
  email: string
  subject: string
  message: string
}

export function ContactPage() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const { data: profile, error } = useFetch<Profile>('/profile')
  const { data: config } = useFetch<SiteConfig>('/config')

  const [form, setForm] = useState<FormState>({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const setField = (field: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const copyToClipboard = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(key)
      toast(t('common.copied'), 'success')
      setTimeout(() => setCopied(null), 2000)
    } catch {
      toast(t('common.copyFailed'), 'error')
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast(t('common.error'), 'error')
      return
    }

    const emailEnabled = config?.features.emailjs ?? EMAILJS_CONFIGURED

    if (emailEnabled) {
      const emailjsConfig = {
        serviceId: config?.emailjs?.serviceId || import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
        templateId: config?.emailjs?.templateId || import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
        publicKey: config?.emailjs?.publicKey || import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
      }
      if (!emailjsConfig.serviceId || !emailjsConfig.templateId || !emailjsConfig.publicKey) {
        toast(t('contact.emailjsNotConfigured'), 'info')
        return
      }
      setSending(true)
      try {
        await sendEmail(form, emailjsConfig)
        setForm({ name: '', email: '', subject: '', message: '' })
        toast(t('contact.success'), 'success')
      } catch {
        toast(t('contact.error'), 'error')
      } finally {
        setSending(false)
      }
    } else {
      const mailto = `mailto:${profile?.personalInfo?.email}?subject=${encodeURIComponent(
        form.subject || 'Hello',
      )}&body=${encodeURIComponent(`${form.message}\n\n- ${form.name} (${form.email})`)}`
      window.location.href = mailto
      toast(t('contact.emailjsNotConfigured'), 'info')
    }
  }

  const infoCards = [
    {
      key: 'email',
      label: 'Email',
      value: profile?.personalInfo?.email || profile?.socials?.email || '-',
      icon: Mail,
      href: `mailto:${profile?.socials?.email || ''}`,
      copyable: true,
    },
    {
      key: 'whatsapp',
      label: t('contact.phone'),
      value: profile?.socials?.whatsapp || '-',
      icon: Phone,
      href: profile?.socials?.whatsapp ? `https://wa.me/${profile.socials.whatsapp.replace(/[^0-9]/g, '')}` : undefined,
    },
    {
      key: 'location',
      label: t('contact.location'),
      value: profile?.personalInfo?.location || '-',
      icon: MapPin,
    },
    {
      key: 'message',
      label: t('contact.formTitle'),
      value: profile?.socials?.discord || '-',
      icon: MessageSquare,
      copyable: true,
    },
  ]

  const socials = profile?.socials

  return (
    <>
      <SEO
        title={t('nav.contact')}
        description={t('contact.subtitle')}
        canonicalPath="/contact"
      />
      <PageHero eyebrow={t('contact.eyebrow')} title={t('contact.title')} subtitle={t('contact.subtitle')} />

      <Section className="pt-6">
        <Container>
          {error ? (
            <ErrorState message={error} />
          ) : (
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="space-y-6">
                <Reveal>
                  <h2 className="font-display text-2xl font-bold">{t('contact.infoTitle')}</h2>
                </Reveal>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {infoCards.map((card, index) => (
                    <Reveal key={card.key} delay={index * 0.07}>
                      <Card className="group transition-all duration-300 hover:border-primary/40">
                        <CardContent className="flex items-center gap-4 p-5">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                            <card.icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">{card.label}</p>
                            <p className="truncate text-sm font-medium">{card.value}</p>
                          </div>
                          {card.copyable && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              aria-label={`copy ${card.label}`}
                              onClick={() => copyToClipboard(card.key, card.value)}
                            >
                              {copied === card.key ? (
                                <Check className="h-4 w-4 text-primary" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </Reveal>
                  ))}
                </div>

                <Reveal delay={0.3}>
                  <div className="flex gap-3 pt-2">
                    {socials?.github && (
                      <a
                        href={socials.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:text-primary"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                    {socials?.linkedin && (
                      <a
                        href={socials.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:text-primary"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {socials?.instagram && (
                      <a
                        href={socials.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:text-primary"
                      >
                        <Instagram className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </Reveal>
              </div>

              <Reveal delay={0.15} direction="left">
                <Card className="h-full">
                  <div className="border-b border-border/60 px-6 py-4">
                    <h2 className="font-display text-lg font-semibold">{t('contact.formTitle')}</h2>
                  </div>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t('contact.name')} *</Label>
                        <Input
                          id="name"
                          value={form.name}
                          onChange={(e) => setField('name')(e.target.value)}
                          placeholder={t('contact.namePlaceholder')}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('contact.email')} *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => setField('email')(e.target.value)}
                          placeholder={t('contact.emailPlaceholder')}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">{t('contact.subject')}</Label>
                      <Input
                        id="subject"
                        value={form.subject}
                        onChange={(e) => setField('subject')(e.target.value)}
                        placeholder={t('contact.subjectPlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">{t('contact.message')} *</Label>
                      <Textarea
                        id="message"
                        value={form.message}
                        onChange={(e) => setField('message')(e.target.value)}
                        placeholder={t('contact.messagePlaceholder')}
                        rows={6}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={sending} className="gap-2 self-start">
                      <Send />
                      {sending ? t('common.sending') : t('contact.send')}
                    </Button>
                  </form>
                </Card>
              </Reveal>
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
