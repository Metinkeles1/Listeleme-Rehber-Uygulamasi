class Kisi {
    constructor(ad, soyad, mail) {
        this.ad = ad;
        this.soyad = soyad;
        this.mail = mail;
    }
}

class Util {
    static bosAlanKontrolEt(...alanlar) {
        let sonuc = true;
        alanlar.forEach(alan => {
            if (alan.length === 0) {
                sonuc = false;
                return false;
            }
        });
        return sonuc;
    }

    static emailGecerliMi(email) {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    }
}

class Ekran {
    constructor() {
        this.ad = document.getElementById('ad');
        this.soyad = document.getElementById('soyad');
        this.mail = document.getElementById('mail');
        this.ekleGüncelleButton = document.querySelector('.kaydetGuncelle');
        this.form = document.getElementById('form-rehber');
        this.form.addEventListener('submit', this.kaydetGuncelle.bind(this));
        this.kisiListesi = document.querySelector('.kisi-listesi');
        this.kisiListesi.addEventListener('click', this.GuncelleVeyaSil.bind(this))
        this.Depo = new Depo();
        //* update ve delete butonlarına basıldığında ilgili tr elementi burada tutulur.
        this.secilenSatir = undefined;
        this.kisileriEkranaYazdir();
    }

    alanlariTemizle() {
        this.ad.value = '';
        this.soyad.value = '';
        this.mail.value = '';
    }

    GuncelleVeyaSil(e) {
        const tiklanmaYeri = e.target;

        if (tiklanmaYeri.classList.contains('btn-delete')) {
            this.secilenSatir = tiklanmaYeri.parentElement.parentElement;
            this.kisiyiEkrandanSil();

        } else if (tiklanmaYeri.classList.contains('btn-edit')) {
            this.secilenSatir = tiklanmaYeri.parentElement.parentElement;
            this.ekleGüncelleButton.value = 'Güncelle';
            //* edit butonuna tıklanılan güncellenicek değerleri inputlara aktarır.
            this.ad.value = this.secilenSatir.cells[0].textContent;
            this.soyad.value = this.secilenSatir.cells[1].textContent;
            this.mail.value = this.secilenSatir.cells[2].textContent;
        }
    }

    kisiyiEkrandaGuncelle(kisi) {

        const sonuc = this.Depo.kisiGuncelle(kisi, this.secilenSatir.cells[2].textContent);

        if (sonuc) {
            this.secilenSatir.cells[0].textContent = kisi.ad;
            this.secilenSatir.cells[1].textContent = kisi.soyad;
            this.secilenSatir.cells[2].textContent = kisi.mail;

            this.alanlariTemizle();
            this.secilenSatir = undefined;
            this.ekleGüncelleButton.value = 'Kaydet';
            this.bilgiOlustur('Kişi Güncellendi', true);
        } else {
            this.bilgiOlustur('Yazdığınız mail kullanımda', false);
        }
    }

    kisiyiEkrandanSil() {
        this.secilenSatir.remove();
        const silinecekMail = this.secilenSatir.cells[2].textContent;

        this.Depo.kisiSil(silinecekMail);
        this.alanlariTemizle();
        this.secilenSatir = undefined;
        this.bilgiOlustur('Kişi Rehberden Silindi', true);
    }

    kisileriEkranaYazdir() {
        this.Depo.tumKisiler.forEach(kisi => {
            this.kisiyiEkranaEkle(kisi);
        });
    }

    kisiyiEkranaEkle(kisi) {
        const olusturulanTR = document.createElement('tr');
        olusturulanTR.innerHTML = ` 
        <td>${kisi.ad}</td>
        <td>${kisi.soyad}</td>
        <td>${kisi.mail}</td>
        <td>
            <button class="btn btn-delete"><i class="far fa-trash-alt" aria-hidden="true"></i></button>
            <button class="btn btn-edit"><i class="far fa-edit" aria-hidden="true"></i></button>
        </td>`;

        this.kisiListesi.appendChild(olusturulanTR);
    }

    bilgiOlustur(mesaj, durum) {
        const uyariDivi = document.querySelector('.bilgi');

        uyariDivi.innerHTML = mesaj;

        uyariDivi.classList.add(durum ? 'bilgi-success' : 'bilgi-error');


        //* setTimeOut,setInterval
        //! settimeout tanımladığımız değerin kaç saniye sonra işlem göreceğini belirler
        //! setinterval ise kaç saniyede bir işlem yapılacağını belirler
        setTimeout(function() {
            uyariDivi.className = 'bilgi';
        }, 2000);
    }

    kaydetGuncelle(e) {
        e.preventDefault();
        const kisi = new Kisi(this.ad.value, this.soyad.value, this.mail.value);
        const sonuc = Util.bosAlanKontrolEt(kisi.ad, kisi.soyad, kisi.mail);
        const emailGecerliMi = Util.emailGecerliMi(this.mail.value);
        console.log(this.mail.value + " için email kontrolu sonuc: " + emailGecerliMi);

        //* tüm alanlar doldurulmuş
        if (sonuc) {

            if (!emailGecerliMi) {
                this.bilgiOlustur('geçerli bir mail yazınız', false);
                return;
            }

            if (this.secilenSatir) {
                //* secilen satır undefined değilse güncellenicek demektir.
                this.kisiyiEkrandaGuncelle(kisi);
            } else {
                //* secilen satır undefined ise ekleme yapılacaktır.
                //* yeni kişiyi ekrana ekler

                //* localStorage ekle
                const sonuc = this.Depo.kisiEkle(kisi);
                if (sonuc) {
                    this.bilgiOlustur('Başarıyla Eklendi', true);
                    this.kisiyiEkranaEkle(kisi);
                    this.alanlariTemizle();
                } else {
                    this.bilgiOlustur('Bu mail kullanımda', false);
                }
            }

        } else { //* bazı alanlar boş
            this.bilgiOlustur('Boş alanları doldurunuz.', false);
        }
    };
}


class Depo {
    //*uygulama ilk açıldığında veriler getirilir.
    constructor() {
        this.tumKisiler = this.KisileriGetir();
    }

    emailEssizMi(mail) {
        const sonuc = this.tumKisiler.find(kisi => {
            return kisi.mail === mail;
        });

        //* demekki bu maili kullanan biri var
        if (sonuc) {
            console.log(mail + " Kullanımda");
            return false;
        } else {
            console.log(mail + " Kullanımda değil");
            return true;
        }
    }

    KisileriGetir() {
        let tumKisilerLocal = [];
        if (localStorage.getItem('tumKisiler') === null) {
            tumKisilerLocal = [];
        } else {
            tumKisilerLocal = JSON.parse(localStorage.getItem('tumKisiler'));
        }
        return tumKisilerLocal;
    }

    kisiEkle(kisi) {
        if (this.emailEssizMi(kisi.mail)) {
            this.tumKisiler.push(kisi);
            localStorage.setItem('tumKisiler', JSON.stringify(this.tumKisiler));
            return true;
        } else {
            return false;
        }
    }

    kisiSil(mail) {
        this.tumKisiler.forEach((kisi, index) => {
            if (kisi.mail === mail) {
                this.tumKisiler.splice(index, 1);
            }
        });
        localStorage.setItem('tumKisiler', JSON.stringify(this.tumKisiler));
    }

    kisiGuncelle(guncellenmisKisi, mail) {
        if (guncellenmisKisi.mail === mail) {
            this.tumKisiler.forEach((kisi, index) => {
                if (kisi.mail === mail) {
                    this.tumKisiler[index] = guncellenmisKisi;
                    localStorage.setItem('tumKisiler', JSON.stringify(this.tumKisiler));
                    return true;
                }
            });
            return true;
        }

        //* guncellenmisKisi yeni değerleri içerir
        //* mail kişinin veritabanında bulunması için eski mailini içerir.
        if (this.emailEssizMi(guncellenmisKisi.mail)) {
            this.tumKisiler.forEach((kisi, index) => {
                if (kisi.mail === mail) {
                    this.tumKisiler[index] = guncellenmisKisi;
                    localStorage.setItem('tumKisiler', JSON.stringify(this.tumKisiler));
                    return true;
                }
            });
            return true;

        } else {
            return false;
        }
    }

}

document.addEventListener('DOMContentLoaded', function(e) {
    const ekran = new Ekran();
})