$(document).foundation();
var CurrentID=0;
$(function() {
  //get cookie & loginID
  var appCookie = Cookies.getJSON('appCookie'),
    loginID = appCookie.loginID;
  $('#submit').click(function() {
    SaveAppealforExtendedSubsidies();
  });

  $('.calcNumber').each(function(index,item){
    $('.totalNumber,.grandTotalNumber').attr('readonly','readonly');
      $(item).change(function(){
        CalcTotal(this,index);
      });
  });

  $.when(formSectionsInit(),formOthersInit(),GetDropdownList('.selOccupation', 'Jobs Category'),GetRelationship('.selRelationship')).then(function(){
    var ID= '';
    ID=GetQueryString('ID');
    if (ID.length>0) {
      GetAppealforExtendedSubsidies(ID)
    }
  });
});


//get url param
function GetQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        var context = "";
        if (r != null)
            context = r[2];
        reg = null;
        r = null;
        return context == null || context == "" || context == "undefined" ? "" : context;
}
//get data
function GetAppealforExtendedSubsidies(ID) {
      var data = { 'ID': ID };
      $.ajax({
            url: apiSrc + "BCMain/iCtc1.GetAppealforExtendedForm.json",
          method: "POST",
          dataType: "json",
          xhrFields: { withCredentials: true },
          data: {
              'data': JSON.stringify(data),
              'WebPartKey': '021cb7cca70748ff89795e3ad544d5eb',
              'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
          },
          success: function (data) {
              if ((data) && (data.d.RetVal === -1)) {
                  if (data.d.RetData.Tbl.Rows.length > 0) {
                      var AppealforExtended = data.d.RetData.Tbl.Rows[0];
                      CurrentID=AppealforExtended.ID||0;
                      $('#step1_Name').val(AppealforExtended.Step1_Name || '')
                      $('#step1_MDName').val(AppealforExtended.Step1_MDName|| '')
                      $('#step1_NRIC').val(AppealforExtended.Step1_NRIC || '')
                      $('#step1_Contact').val(AppealforExtended.Step1_Contact|| '')
                      $('#step1_PostalCode').val(AppealforExtended.Step1_PostalCode || '')
                      $('#step1_BlockNo').val(AppealforExtended.Step1_BlockNo|| '')
                      $('#step1_Level').val(AppealforExtended.Step1_Level || '')
                      $('#step1_BuildingName').val(AppealforExtended.Step1_BuildingName|| '')
                      $('#step1_StreetName').val(AppealforExtended.Step1_StreetName || '')
                      $('#step1_Email').val(AppealforExtended.Step1_Email|| '')
                      var step1_Reason=AppealforExtended.Step1_Reason || '';
                      if (step1_Reason.length > 0) {

                          var step1_ReasonArr = step1_Reason.split(',');
                          var Otherstep1_Reason = '';

                          for (var i = 0; i < step1_ReasonArr.length; i++) {
                              if (step1_ReasonArr[i].length > 0) {
                                  var flag = false;
                                  $('input[name="step1_Reason"]').each(function () {
                                      if ($(this).val() == step1_ReasonArr[i]) { $(this).prop('checked', true); flag = true; }
                                  });
                                  if (flag == false) {
                                      Otherstep1_Reason += step1_ReasonArr[i] + ' ';
                                  }
                              }

                          }
                          if (Otherstep1_Reason.length > 0) {
                              $('#step1_ReasonOther').val(Otherstep1_Reason);
                              $('input[name="step1_Reason"]').each(function () {
                                  if ($(this).val() == 'Others') { $(this).prop('checked', true); }
                              });
                          }
                      }
                      var step2_Attached=AppealforExtended.Step2_Attached||'';
                      if (step2_Attached == true) {
                        $('#step2_AttachedYes').prop('checked', true)
                      }else if(step2_Attached == false){
                          $('#step2_AttachedNo').prop('checked', true)
                      }else {

                      }
                      var Step3_DECLARATION1= AppealforExtended.Step3_DECLARATION1||'';
                      if (Step3_DECLARATION1.length>0 && Step3_DECLARATION1=='step3_CheckBox1') {
                        $('#step3_CheckBox1').prop('checked', true);
                      }
                      var Step3_DECLARATION2=AppealforExtended.Step3_DECLARATION2 || '';
                      if (Step3_DECLARATION2.length>0) {
                        var Step3_DECLARATION2Arr = Step3_DECLARATION2.split(',');
                        for (var i = 0; i < Step3_DECLARATION2Arr.length; i++) {
                            if (Step3_DECLARATION2Arr[i].length > 0) {
                                $('input[name="step3_DECLARATION2"]').each(function () {
                                    if ($(this).val() == Step3_DECLARATION2Arr[i]) { $(this).prop('checked', true); }
                                });
                            }
                        }
                      }
                      var Installment=AppealforExtended.Installment||'';
                      var InstallmentArr=Installment.split('•');
                      $('#MonthlyInstallment').val(InstallmentArr[0])
                      $('#AdhocInstallment').val(InstallmentArr[1])
                      $('#RemarksInstallment').val(InstallmentArr[2])

                      var Rental=AppealforExtended.Rental||'';
                      var RentalArr=Rental.split('•');
                      $('#MonthlyRental').val(RentalArr[0])
                      $('#AdhocRental').val(RentalArr[1])
                      $('#RemarksRental').val(RentalArr[2])

                      var Utilities=AppealforExtended.Utilities||'';
                      var UtilitiesArr=Utilities.split('•');
                      $('#MonthlyUtilities').val(UtilitiesArr[0])
                      $('#AdhocUtilities').val(UtilitiesArr[1])
                      $('#RemarksUtilities').val(UtilitiesArr[2])

                      var Conservancy=AppealforExtended.Conservancy||'';
                      var ConservancyArr=Conservancy.split('•');
                      $('#MonthlyConservancy').val(ConservancyArr[0])
                      $('#AdhocConservancy').val(ConservancyArr[1])
                      $('#RemarksConservancy').val(ConservancyArr[2])

                      var Home=AppealforExtended.Home||'';
                      var HomeArr=Home.split('•');
                      $('#MonthlyHome').val(HomeArr[0])
                      $('#AdhocHome').val(HomeArr[1])
                      $('#RemarksHome').val(HomeArr[2])

                      var Mobile=AppealforExtended.Mobile||'';
                      var MobileArr=Mobile.split('•');
                      $('#MonthlyMobile').val(MobileArr[0])
                      $('#AdhocMobile').val(MobileArr[1])
                      $('#RemarksMobile').val(MobileArr[2])

                      var Meals=AppealforExtended.Meals||'';
                      var MealsArr=Meals.split('•');
                      $('#MonthlyMeals').val(MealsArr[0])
                      $('#AdhocMeals').val(MealsArr[1])
                      $('#RemarksMeals').val(MealsArr[2])

                      var ByPerson=AppealforExtended.ByPerson||'';
                      var ByPersonArr=ByPerson.split('•');
                      $('#MonthlyByPerson').val(ByPersonArr[0])
                      $('#AdhocByPerson').val(ByPersonArr[1])
                      $('#RemarksByPerson').val(ByPersonArr[2])

                      var Equipment=AppealforExtended.Equipment||'';
                      var EquipmentArr=Equipment.split('•');
                      $('#MonthlyEquipment').val(EquipmentArr[0])
                      $('#AdhocEquipment').val(EquipmentArr[1])
                      $('#RemarksEquipment').val(EquipmentArr[2])

                      var Therapy=AppealforExtended.Therapy||'';
                      var TherapyArr=Therapy.split('•');
                      $('#MonthlyTherapy').val(TherapyArr[0])
                      $('#AdhocTherapy').val(TherapyArr[1])
                      $('#RemarksTherapy').val(TherapyArr[2])
                      /////////////

                      var HomeHelpService=AppealforExtended.HomeHelpService||'';
                      var HomeHelpServiceArr=HomeHelpService.split('•');
                      $('#MonthlyHomeHelpService').val(HomeHelpServiceArr[0])
                      $('#AdhocHomeHelpService').val(HomeHelpServiceArr[1])
                      $('#RemarksHomeHelpService').val(HomeHelpServiceArr[2])

                      var OtherFamilyMembers=AppealforExtended.OtherFamilyMembers||'';
                      var OtherFamilyMembersArr=OtherFamilyMembers.split('•');
                      $('#MonthlyOtherFamilyMembers').val(OtherFamilyMembersArr[0])
                      $('#AdhocOtherFamilyMembers').val(OtherFamilyMembersArr[1])
                      $('#RemarksOtherFamilyMembers').val(OtherFamilyMembersArr[2])

                      var MedicalExpenses=AppealforExtended.MedicalExpenses||'';
                      var MedicalExpensesArr=MedicalExpenses.split('•');
                      $('#MonthlyMedicalExpenses').val(MedicalExpensesArr[0])
                      $('#AdhocMedicalExpenses').val(MedicalExpensesArr[1])
                      $('#RemarksMedicalExpenses').val(MedicalExpensesArr[2])

                      var Others=AppealforExtended.Others||'';
                      var OthersArr=Others.split('•');
                      $('#MonthlyOthers').val(OthersArr[0])
                      $('#AdhocOthers').val(OthersArr[1])
                      $('#RemarksOthers').val(OthersArr[2])

                      var SchoolFees=AppealforExtended.SchoolFees||'';
                      var SchoolFeesArr=SchoolFees.split('•');
                      $('#MonthlySchoolFees').val(SchoolFeesArr[0])
                      $('#AdhocSchoolFees').val(SchoolFeesArr[1])
                      $('#RemarksSchoolFees').val(SchoolFeesArr[2])

                      var ChildcareCare=AppealforExtended.ChildcareCare||'';
                      var ChildcareCareArr=ChildcareCare.split('•');
                      $('#MonthlyChildcareCare').val(ChildcareCareArr[0])
                      $('#AdhocChildcareCare').val(ChildcareCareArr[1])
                      $('#RemarksChildcareCare').val(ChildcareCareArr[2])

                      var SchoolExpenses=AppealforExtended.SchoolExpenses||'';
                      var SchoolExpensesArr=SchoolExpenses.split('•');
                      $('#MonthlySchoolExpenses').val(SchoolExpensesArr[0])
                      $('#AdhocSchoolExpenses').val(SchoolExpensesArr[1])
                      $('#RemarksSchoolExpenses').val(SchoolExpensesArr[2])

                      var TransportToschool=AppealforExtended.TransportToschool||'';
                      var TransportToschoolArr=TransportToschool.split('•');
                      $('#MonthlyTransportToschool').val(TransportToschoolArr[0])
                      $('#AdhocTransportToschool').val(TransportToschoolArr[1])
                      $('#RemarksTransportToschool').val(TransportToschoolArr[2])

                      var GeneralTransportCost=AppealforExtended.GeneralTransportCost||'';
                      var GeneralTransportCostArr=GeneralTransportCost.split('•');
                      $('#MonthlyGeneralTransportCost').val(GeneralTransportCostArr[0])
                      $('#AdhocGeneralTransportCost').val(GeneralTransportCostArr[1])
                      $('#RemarksGeneralTransportCost').val(GeneralTransportCostArr[2])

                      var SalaryAndLevy=AppealforExtended.SalaryAndLevy||'';
                      var SalaryAndLevyArr=SalaryAndLevy.split('•');
                      $('#MonthlySalaryAndLevy').val(SalaryAndLevyArr[0])
                      $('#AdhocSalaryAndLevy').val(SalaryAndLevyArr[1])
                      $('#RemarksSalaryAndLevy').val(SalaryAndLevyArr[2])

                      var SalaryAndLevy=AppealforExtended.SalaryAndLevy||'';
                      var SalaryAndLevyArr=SalaryAndLevy.split('•');
                      $('#Specify1').val(SalaryAndLevyArr[0])
                      $('#MonthlySpecify1').val(SalaryAndLevyArr[1])
                      $('#AdhocSpecify1').val(SalaryAndLevyArr[2])
                      $('#RemarksSpecify1').val(SalaryAndLevyArr[3])

                      var Specify1=AppealforExtended.Specify1||'';
                      var Specify1Arr=Specify1.split('•');
                      $('#Specify1').val(Specify1Arr[0])
                      $('#MonthlySpecify1').val(Specify1Arr[1])
                      $('#AdhocSpecify1').val(Specify1Arr[2])
                      $('#RemarksSpecify1').val(Specify1Arr[3])

                      var Specify2=AppealforExtended.Specify2||'';
                      var Specify2Arr=Specify2.split('•');
                      $('#Specify2').val(Specify2Arr[0])
                      $('#MonthlySpecify2').val(Specify2Arr[1])
                      $('#AdhocSpecify2').val(Specify2Arr[2])
                      $('#RemarksSpecify2').val(Specify2Arr[3])

                      var Specify3=AppealforExtended.Specify3||'';
                      var Specify3Arr=Specify3.split('•');
                      $('#Specify3').val(Specify3Arr[0])
                      $('#MonthlySpecify3').val(Specify3Arr[1])
                      $('#AdhocSpecify3').val(Specify3Arr[2])
                      $('#RemarksSpecify3').val(Specify3Arr[3])

                      var Specify4=AppealforExtended.Specify4||'';
                      var Specify4Arr=Specify4.split('•');
                      $('#Specify4').val(Specify4Arr[0])
                      $('#MonthlySpecify4').val(Specify4Arr[1])
                      $('#AdhocSpecify4').val(Specify4Arr[2])
                      $('#RemarksSpecify4').val(Specify4Arr[3])

                      var Specify5=AppealforExtended.Specify5||'';
                      var Specify5Arr=Specify5.split('•');
                      $('#Specify5').val(Specify5Arr[0])
                      $('#MonthlySpecify5').val(Specify5Arr[1])
                      $('#AdhocSpecify5').val(Specify5Arr[2])
                      $('#RemarksSpecify5').val(Specify5Arr[3])

                      var Specify5=AppealforExtended.Specify5||'';
                      var Specify5Arr=Specify5.split('•');
                      $('#Specify5').val(Specify5Arr[0])
                      $('#MonthlySpecify5').val(Specify5Arr[1])
                      $('#AdhocSpecify5').val(Specify5Arr[2])
                      $('#RemarksSpecify5').val(Specify5Arr[3])

                      var Total=AppealforExtended.Total||'';
                      var TotalArr=Total.split('•');
                      $('#Total1').val(TotalArr[0])
                      $('#Total2').val(TotalArr[1])
                      $('#Total3').val(TotalArr[2])
                      $('#Total4').val(TotalArr[3])
                      $('#Total5').val(TotalArr[4])
                      $('#Total6').val(TotalArr[5])
                      $('#Total7').val(TotalArr[6])
                      $('#Total8').val(TotalArr[7])
                      $('#Total9').val(TotalArr[8])
                      $('#Total10').val(TotalArr[9])
                      $('#Total11').val(TotalArr[10])
                      $('#Total12').val(TotalArr[11])
                      $('#Total13').val(TotalArr[12])
                      $('#Total14').val(TotalArr[13])
                      $('#Total15').val(TotalArr[14])
                      $('#Total16').val(TotalArr[15])

                      var GrandTotal=AppealforExtended.GrandTotal||'';
                      var GrandTotalArr=GrandTotal.split('•');
                      $('#GrandTotal1').val(GrandTotalArr[0])
                      $('#GrandTotal2').val(GrandTotalArr[1])


                  }
              }
          }
      });
  }




function CalcTotal(elment,index){
  var odd='odd';
  if (index%2==0){
    odd='even';
  }
  $('.totalNumber:'+odd+'').each(function(itemIndex,item){
      var total=0;
      $(item).parents('tr').prevUntil('.titleTr').find('.calcNumber:'+odd+'').each(function(){
         total+=(isNaN(parseFloat($(this).val()))?0:parseFloat($(this).val()));
      });
      $(item).val(total.toFixed(2));
   });

   $('.grandTotalNumber:'+odd+'').each(function(itemIndex,item){
       var total=0;
       $('.totalNumber:'+odd+'').each(function(){
         total+=(isNaN(parseFloat($(this).val()))?0:parseFloat($(this).val()));
       });
      $(item).val(total.toFixed(2));
    });
}

//Submit data
function SaveAppealforExtendedSubsidies() {
  if (!formSectionValidate($('#pageContentWrapper'),1)) {
    return false;
  }
  var data = {};
  data['ID'] = CurrentID;
  $('#pageContentWrapper :input,select').each(function() {
    var type = $(this).attr('type'),
      name = $(this).attr('name'),
      val = $(this).val();
    if (type == "radio") {
      val = $(':input[type="' + type + '"][name="' + name + '"]:checked').val() || '';
    }
    if (type == "checkbox") {
      var tempVal = '';
      $(':input[type="' + type + '"][name="' + name + '"]:checked').each(function(index, item) {
        if ($(item).prop('checked') == true) {
          tempVal += $(item).val() + ',';
        }
      });
      val = (tempVal.length > 0? tempVal.substr(0, tempVal.length - 1): '');
    }
    if ((!data.hasOwnProperty(data[name])) && name) {
      data[name] = val;
    }
  });
  $.ajax({
    url: apiSrc + "BCMain/iCtc1.SaveAppealforExtendedSubsidies.json",
    method: "POST",
    dataType: "json",
    xhrFields: {
      withCredentials: true
    },
    data: {
      'data': JSON.stringify(data),
      'WebPartKey': '021cb7cca70748ff89795e3ad544d5eb',
      'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
    },
    success: function(data) {
      if ((data) && (data.d.RetVal === -1)) {
        alert('Successfully updated!');
        location.reload();
      } else {
        alert(data.d.RetMsg);
      }
    },
    error: function(XMLHttpRequest, data, errorThrown) {
      alert("Error: " + errorThrown);
    }
  });
}

//geneare drop down optioms
function GetDropdownList(id, category) {
  var data = {
    'LookupCat': category
  };
  $.ajax({
    url: apiSrc + "BCMain/iCtc1.Lookup_Get.json",
    method: "POST",
    dataType: "json",
    xhrFields: {
      withCredentials: true
    },
    data: {
      'data': JSON.stringify(data),
      'WebPartKey': '021cb7cca70748ff89795e3ad544d5eb',
      'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
    },
    success: function(data) {
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var lookup = data.d.RetData.Tbl.Rows;
          for (var i = 0; i < lookup.length; i++) {
            $(id).append('<option value="' + lookup[i].LookupKey + '">' + lookup[i].Description + '</option>');
          }
        }
      } else {
        alert(data.d.RetMsg);
      }
    }
  });
}

function GetRelationship(sel) {
  $.ajax({
    url: apiSrc + "BCMain/iCtc1.SearchRelationshipType.json",
    method: "POST",
    dataType: "json",
    xhrFields: {
      withCredentials: true
    },
    data: {
      'data': JSON.stringify({}),
      'WebPartKey': '021cb7cca70748ff89795e3ad544d5eb',
      'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
    },
    success: function(data) {
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var lookup = data.d.RetData.Tbl.Rows;
          for (var i = 0; i < lookup.length; i++) {
            $(sel).append('<option value="' + lookup[i].RelationshipAB + '">' + lookup[i].RelationshipAB  + '</option>');
          }
        }
      } else {
        alert(data.d.RetMsg);
      }
    }
  });
}


function formSectionsInit() {
  $('form.formSection').each(function() {
    var form = $(this);
    var fieldsets = form.find('fieldset');
    var breadcrumbs = form.find('#breadcrumbs');
    var footer = form.find('footer.buttonsGroup');

    form.data('current-form-index',0);

    breadcrumbs.html('');

    fieldsets.each(function(index) {
      var fieldset = $(this);
      fieldset.data('fieldset-index',index);
      breadcrumbs.append('<li><a href="#'+fieldset.prop('id')+'" data-fieldset-index="'+index+'">'+fieldset.find('h2').html()+'</a>').find('li:eq(0) a').addClass('active');

      if(index>0) {
        fieldset.hide();
      }
    });

    breadcrumbs.find('a').click(function() {
      var thisObj = $(this);
      var currentIndex = parseInt(form.data('current-form-index'));
      if (formSectionValidate(form,0) ) {
        loadFormSection(thisObj.data('fieldset-index'),3);
      }
      return false;
    });

    //set buttons
    footer.find('#previous').hide();
    footer.find('[class*=submit]').hide();

    footer.find('#previous').click(function() {

      var currentIndex = parseInt(form.data('current-form-index'));
      var targetIndex = currentIndex-1;

      if (targetIndex <0) targetIndex=0;

      if (formSectionValidate(form,0) ) {
        loadFormSection(targetIndex,0);
      }
      return false;
    });
    footer.find('#next').click(function() {
        if (formSectionValidate(form,0)) {
          var targetIndex = parseInt(form.data('current-form-index')) + 1;
          if (targetIndex >= fieldsets.length) targetIndex=fieldsets.length-1;
          loadFormSection(targetIndex,1);
        }
        return false;
    });

    function loadFormSection(index,isNext) {
      //set index
      form.data('current-form-index', index);
      var targetIndex = index;

      breadcrumbs.find('a').removeClass('active').filter(function() {
        return ($(this).data('fieldset-index') == targetIndex);
      }).addClass('active');

      //set fieldset`
      fieldsets.hide().filter(function() {
        return ($(this).data('fieldset-index') == targetIndex);
      }).show();

      if (index == 0) {
        footer.find('#previous').hide();
        footer.find('#next').show();
        footer.find('[class*=submit]').hide();
      }
      else if (index == fieldsets.length-1) {
        footer.find('#previous').show();
        footer.find('#next').hide();
        footer.find('[class*=submit]').show();
      }
      else {
        footer.find('#previous').show();
        footer.find('#next').show();
        footer.find('[class*=submit]').hide();
      }
    }
  });
}

function formSectionValidate(form,isAll) {
  var result=0;
  if (!isAll) {
      $(form).find('fieldset:hidden :input,select').attr('disabled','disabled');
  }

  $(form).on('formvalid.zf.abide',function(){result=1;});
  $(form).foundation('validateForm');
  $(form).find('fieldset :input,select').removeAttr('disabled');
  return result;
}

function formOthersInit() {
  $('[data-form-other-text=true]').prop('disabled','disabled');
  $('[data-form-other]').each(function(){
    var thisObj = $(this);
    var targetVal = thisObj.data('form-other');
    var targetObj = $('#' + targetVal);
    var target = $('#' + targetVal);


    if (thisObj.prop('type')=='checkbox') {
      //console.log('checkbox');
      thisObj.click(function() {
        if (thisObj.is(':checked')) {
          targetObj.prop('disabled','');
        }
        else {
          targetObj.val('');
          targetObj.prop('disabled','disabled');
        }
      });
    }
    else if (thisObj.prop('type') == 'radio') {
      var radioName = thisObj.prop('name');
      var thisVal = thisObj.val();
      var radioGroup = $('[name='+radioName+']');

      radioGroup.click(function() {

        if ($('[name='+radioName+']:checked').val() == thisVal) {
          targetObj.prop('disabled','');
        }
        else {
          targetObj.val('');
          targetObj.prop('disabled','disabled');
        }
      });
    }
    else if (thisObj.is('select')) {
      thisObj.change(function() {
        var thisVal = thisObj.val();
        //console.log('select');
        if (thisVal.toLowerCase()=='other' || thisVal.toLowerCase()=='others') {
          targetObj.prop('disabled','');
        }
        else {
          targetObj.val('');
          targetObj.prop('disabled','disabled');
        }
      });
    }
  });
}
