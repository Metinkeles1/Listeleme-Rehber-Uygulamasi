//* arayüz elementleri seçelim
const ad = document.getElementById('ad');
const soyad = document.getElementById('soyad');
const mail = document.getElementById('mail');

const form = document.getElementById('form-rehber');
const kisiListesi = document.querySelector('.kisi-listesi');

//* event listenerların tanımlanması
form.addEventListener('submit', kaydet);
kisiListesi.addEventListener('click', kisiIslemleriniYap);

//* tüm kişiler için dizi
const tümKisilerDizisi = [];
let secilenSatir = undefined;

function kisiIslemleriniYap(event) {
    if (event.target.classList.contains('btn-delete')) {
        const silinecekTr = event.target.parentElement.parentElement;
        const silinecekMail = event.target.parentElement.previousElementSibling.textContent;
        rehberdenSil(silinecekTr, silinecekMail);
    } else if (event.target.classList.contains('btn-edit')) {
        document.querySelector('.kaydetGuncelle').value = 'Güncelle'
        const secilenTR = event.target.parentElement.parentElement;
        const guncellenecekMail = secilenTR.cells[2].textContent;

        ad.value = secilenTR.cells[0].textContent;
        soyad.value = secilenTR.cells[1].textContent;
        mail.value = secilenTR.cells[2].textContent;

        secilenSatir = secilenTR;
        console.log(tümKisilerDizisi);
    }
}

function rehberdenSil(silinecekTrElement, silinecekMail) {
    silinecekTrElement.remove();
    console.log(silinecekTrElement, silinecekMail);

    //! silme yöntemi 1
    //* maile göre silme işlemi
    // tümKisilerDizisi.forEach((kisi, index) => {
    //     if (kisi.mail === silinecekMail) {
    //         tümKisilerDizisi.splice(index, 1);
    //     }
    // });

    //! silme yöntemi 2
    const silinmeyecekKisiler = tümKisilerDizisi.filter(function(kisi, index) {
        return kisi.mail !== silinecekMail;
    });
    //* tumkisilerdizisini biz const olarak belirlediğimiz için önce dizinin içini bolşaltıyoruz
    //* sonra silinmeyecekkisiler adlı dizimizin elemanlarını spread methodu ile tumkisiler dizisinin içine push ediyoruz.
    tümKisilerDizisi.length = 0;
    tümKisilerDizisi.push(...silinmeyecekKisiler);

    alanlariTemizle();
    document.querySelector('.kaydetGuncelle').value = 'Kaydet';
}

function kaydet(e) {
    e.preventDefault();
    const eklenecekVeyaGuncellenicekKisi = {
        ad: ad.value,
        soyad: soyad.value,
        mail: mail.value,
    }

    const sonuc = verileriKontrolEt(eklenecekVeyaGuncellenicekKisi);
    if (sonuc.durum) {
        if (secilenSatir) {

            kisiyiGuncelle(eklenecekVeyaGuncellenicekKisi);
        } else {
            kisiyiEkle(eklenecekVeyaGuncellenicekKisi);
        }

    } else {
        bilgiOlustur(sonuc.mesaj, sonuc.durum);
    }
}

function kisiyiGuncelle(kisi) {
    //* kisi parametresinde secilen kisinin yeni değerleri vardır.
    //*seçilen satırda da eski değerler var
    for (let i = 0; i < tümKisilerDizisi.length; i++) {
        if (tümKisilerDizisi[i].mail === secilenSatir.cells[2].textContent) {
            tümKisilerDizisi[i] = kisi;
            break;
        }
    }
    secilenSatir.cells[0].textContent = kisi.ad;
    secilenSatir.cells[1].textContent = kisi.soyad;
    secilenSatir.cells[2].textContent = kisi.mail;

    document.querySelector('.kaydetGuncelle').value = 'Kaydet';
    secilenSatir = undefined;

    console.log(tümKisilerDizisi);
}

function kisiyiEkle(eklenecekVeyaGuncellenicekKisi) {
    const olusturulanTrElementi = document.createElement('tr');
    olusturulanTrElementi.innerHTML = `  
    <td>${eklenecekVeyaGuncellenicekKisi.ad}</td>
    <td>${eklenecekVeyaGuncellenicekKisi.soyad}</td>
    <td>${eklenecekVeyaGuncellenicekKisi.mail}</td>
    <td>
        <button class="btn btn-delete"><i class="far fa-trash-alt" aria-hidden="true"></i></button>
        <button class="btn btn-edit"><i class="far fa-edit" aria-hidden="true"></i></button>
    </td>`;

    kisiListesi.appendChild(olusturulanTrElementi);
    tümKisilerDizisi.push(eklenecekVeyaGuncellenicekKisi);
    console.log('***DİZİYE EKLENDİ');
    console.log(tümKisilerDizisi);
    bilgiOlustur('kisi rehbere kaydedildi', true);
}

function verileriKontrolEt(kisi) {
    //* objelerde in kullanımı
    for (const deger in kisi) {
        if (kisi[deger]) {
            // console.log(kisi[deger])
        } else {
            const sonuc = {
                durum: false,
                mesaj: 'boş alan bırakmayınız',
            }
            return sonuc;
        }
    }
    alanlariTemizle();
    return {
        durum: true,
        mesaj: "Kaydedildi",
    }
}

function bilgiOlustur(mesaj, durum) {
    const olusturulanBilgi = document.createElement('div');
    olusturulanBilgi.textContent = mesaj;
    olusturulanBilgi.className = 'bilgi';

    olusturulanBilgi.classList.add(durum ? 'bilgi-success' : 'bilgi-error');
    document.querySelector('.container').insertBefore(olusturulanBilgi, form);

    //* setTimeOut,setInterval
    //! settimeout tanımladığımız değerin kaç saniye sonra işlem göreceğini belirler
    //! setinterval ise kaç saniyede bir işlem yapılacağını belirler.
    setTimeout(function() {
        const silinecekDİv = document.querySelector('.bilgi');
        if (silinecekDİv) {
            silinecekDİv.remove();
        }
    }, 2000);
}

function alanlariTemizle() {
    ad.value = '';
    soyad.value = '';
    mail.value = '';
}