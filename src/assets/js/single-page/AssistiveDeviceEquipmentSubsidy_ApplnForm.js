Foundation.Abide.defaults.patterns['NRIC'] = /^[A-Z]{1}[0-9]{7}[A-Z]{1}$/;
Foundation.Abide.defaults.patterns['Mobile'] = /^\+{0,1}\d{8,}$/;
var CurrentID = 0;
$(document).foundation();

var moveToSectionC = 0;
$(function () {
    //get cookie & loginID
    var appCookie = Cookies.getJSON('appCookie'),
      loginID = appCookie.loginID;
    formSectionsInit();
    $('#submit').click(function () {
        Save();
    });
    //get data
    $.when(formSectionsInit(), GetRelationship('.selRelationship')).then(function () {
        var ID = '';
        ID = GetQueryString('ID');
        if (ID.length > 0) {
            GetAssistiveDeviceEquipment(ID)
        }
    });
    $('#sectionA_PostalCode').blur(function () {
        if ($(this).val() !== '') {
            GetAddress();
        }
    });
});
function LoadDataByordinaryNo(OrdinaryNo) {
    $.ajax({
        url: apiSrc + "BCMain/iCtc1.GetAssistMemberShipByGroupID.json",
        method: "POST",
        dataType: "json",
        xhrFields: {
            withCredentials: true
        },
        data: {
            'data': JSON.stringify({ 'GroupID': OrdinaryNo }),
            'WebPartKey': '021cb7cca70748ff89795e3ad544d5eb',
            'ReqGUID': 'b4bbedbf-e591-4b7a-ad20-101f8f656277'
        },
        success: function (data) {
            if ((data) && (data.d.RetVal === -1)) {
                //section a
                if (data.d.RetData.Tbls[0].Rows.length > 0) {
                    var row = data.d.RetData.Tbls[0].Rows[0];
                    for (e in row) {
                        $('#section' + e).val(row[e]);
                    }
                }
                //section b
                if (data.d.RetData.Tbls[1].Rows.length > 0) {
                    var row = data.d.RetData.Tbls[1].Rows[0];
                    for (e in row) {
                        $('#section' + e).val(row[e]);
                    }
                }
            } else {
                alert(data.d.RetMsg);
            }
        }
    });
}

function GetAddress() {
    var data = { 'Country': 'Singapore', 'PostalCode': $('#sectionA_PostalCode').val() };
    $.ajax({
        url: apiSrc + "BCMain/iCtc1.GetAddressByPostalCode.json",
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
                    var ResultA = data.d.RetData.Tbl.Rows[0];
                    $('#sectionA_HouseBlock').val(ResultA.AddrP1);
                    $('#sectionA_Level').val(ResultA.AddrP2);
                    $('#sectionA_StreetName').val(ResultA.AddrP3);
                    $('#sectionA_BuildingName').val(ResultA.AddrP4);

                }
            }
        }
    });

}

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
function GetAssistiveDeviceEquipment(ID) {
    var data = { 'ID': ID };
    $.ajax({
        url: apiSrc + "BCMain/iCtc1.GetAssistiveDeviceEquipmentForm.json",
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
                    var AssistiveDevice = data.d.RetData.Tbl.Rows[0];
                    CurrentID = AssistiveDevice.ID || 0;
                    $('#sectionA_Ordinary').prop('checked',true);
                    $('#GroupIDDiv').show();$('#GroupID').val(AssistiveDevice.GroupID||'');

                    $('#sectionA_FamilyName').val(AssistiveDevice.SectionAFamilyName || '')
                    $('#sectionA_GivenName').val(AssistiveDevice.SectionAGivenName || '')
                    $('#sectionA_DisplayName').val(AssistiveDevice.SectionADisplayName || '')
                    $('#sectionA_nric').val(AssistiveDevice.SectionANRIC || '')
                    $('#sectionA_Birth').val(AssistiveDevice.SectionABirth || '')
                    $('#sectionA_email').val(AssistiveDevice.SectionAEmail || '')
                    $('#sectionA_mobile').val(AssistiveDevice.SectionAMobile || '')
                    $('#sectionA_home').val(AssistiveDevice.SectionATelNoHome || '')
                    $('#sectionA_office').val(AssistiveDevice.SectionATelNoOffice || '')

                    $('#sectionA_PostalCode').val(AssistiveDevice.SectionAPostalCode|| '')
                    $('#sectionA_BlockNo').val(AssistiveDevice.SectionABlockNo|| '')
                    $('#sectionA_Level').val(AssistiveDevice.SectionALevelUnit|| '')
                    $('#sectionA_BuildingName').val(AssistiveDevice.SectionABuildingName|| '')
                    $('#sectionA_StreetName').val(AssistiveDevice.SectionAStreetName|| '')

                    $('#sectionB_FamilyName').val(AssistiveDevice.SectionBFamilyName || '')
                    $('#sectionB_GivenName').val(AssistiveDevice.SectionBGivenName || '')
                    $('#sectionB_DisplayName').val(AssistiveDevice.SectionBDisplayName || '')
                    $('#sectionB_nric').val(AssistiveDevice.SectionBNRIC || '')
                    $('#sectionB_Birth').val(AssistiveDevice.SectionBBirth || '')
                    $('#sectionB_mobile').val(AssistiveDevice.SectionBHandphone || '')
                    $('#sectionB_home').val(AssistiveDevice.SectionBTelNoHome || '')
                    $('#sectionB_office').val(AssistiveDevice.SectionBTelNoOffice || '')
                    $('#sectionB_relationship').val(AssistiveDevice.SectionBRelationship || '')
                    $('#sectionB_email').val(AssistiveDevice.SectionBEmail || '')

                    $('#sectionC_TypeofEquipment').val(AssistiveDevice.SectionCTypeofEquipment || '')
                    $('#sectionC_ReasonsforPurchase').val(AssistiveDevice.SectionCReasonsforPurchase || '')
                    var SectionCItem = AssistiveDevice.SectionCItem1 || '';

                    if (SectionCItem.length > 0) {
                        var SectionCItemArr = SectionCItem.split(',');
                        $('#sectionC_Items1').val(SectionCItemArr[0])
                        $('#sectionC_Items2').val(SectionCItemArr[0])
                        $('#sectionC_Items3').val(SectionCItemArr[0])
                    }
                    var sectionC_Price = AssistiveDevice.SectionCItem2 || '';

                    if (sectionC_Price.length > 0) {
                        var sectionC_PriceArr = sectionC_Price.split(',');
                        $('#sectionC_Price1').val(sectionC_PriceArr[0])
                        $('#sectionC_Price2').val(sectionC_PriceArr[1])
                        $('#sectionC_Price3').val(sectionC_PriceArr[2])
                    }
                    var sectionC_Name = AssistiveDevice.SectionCItem3 || '';

                    if (sectionC_Name.length > 0) {
                        var sectionC_NameArr = sectionC_Name.split(',');
                        $('#sectionC_Name1').val(sectionC_NameArr[0])
                        $('#sectionC_Name2').val(sectionC_NameArr[1])
                        $('#sectionC_Name3').val(sectionC_NameArr[2])
                    }

                    var SectionCEquipmentRecommend = AssistiveDevice.SectionCEquipmentRecommend || '';
                    if (SectionCEquipmentRecommend == true) {
                        $('#sectionC_EquipmentRecommendYes').prop('checked', true)
                    } else if (SectionCEquipmentRecommend == false) {
                        $('#sectionC_EquipmentRecommendNo').prop('checked', true)
                    } else {

                    }
                    var SectionCPreviousApplicant = AssistiveDevice.SectionCPreviousApplicant || '';
                    if (SectionCPreviousApplicant == true) {
                        $('#sectionC_PreviousApplicantYes').prop('checked', true)
                    } else if (SectionCPreviousApplicant == false) {
                        $('#sectionC_PreviousApplicantNo').prop('checked', true)
                    } else {

                    }

                    var SectionDValidMeanTest = AssistiveDevice.SectionDValidMeanTest || '';
                    if (SectionDValidMeanTest == true) {
                        $('#sectionD_ValidMeanTestYes').prop('checked', true)
                    } else if (SectionDValidMeanTest == false) {
                        $('#sectionD_ValidMeanTestNo').prop('checked', true)
                    } else {

                    }

                    var SectionDOtherAgencies = AssistiveDevice.SectionDOtherAgencies || '';

                    if (SectionDOtherAgencies.length > 0) {
                        if (SectionDOtherAgencies == false) {
                            $('#sectionD_OtherAgenciesNo').prop('checked', true)

                        } else {
                            $('#sectionD_OtherAgenciesYes').prop('checked', true)
                            $('#sectionD_SourceDetails').val(SectionDOtherAgencies)
                        }
                    }
                    var SectionECheckbox = AssistiveDevice.SectionECheckbox || '';
                    var SectionECheckboxArr = SectionECheckbox.split(',');
                    for (var i = 0; i < SectionECheckboxArr.length; i++) {
                        if (SectionECheckboxArr[i].length > 0) {
                            $('input[name="sectionE_Check"]').each(function () {
                                if ($(this).val() == SectionECheckboxArr[i]) { $(this).prop('checked', true); }
                            });
                        }
                    }
                    var SectionEMain = AssistiveDevice.SectionEMainName || '';
                    if (SectionEMain.length > 0) {
                        var SectionEMainArr = SectionEMain.split(',');
                        $('#sectionE_MainName').val(SectionEMainArr[0])
                        $('#sectionE_MainSignature').val(SectionEMainArr[1])
                        $('#sectionE_MainDate').val(SectionEMainArr[2])
                    }


                    var SectionEOrdinary = AssistiveDevice.SectionEOrdinaryName || '';
                    if (SectionEOrdinary.length > 0) {
                        var SectionEOrdinaryArr = SectionEOrdinary.split(',');
                        $('#sectionE_MemberName').val(SectionEOrdinaryArr[0])
                        $('#sectionE_MemberSignature').val(SectionEOrdinaryArr[1])
                        $('#sectionE_MemberDate').val(SectionEOrdinaryArr[2])
                    }
                    var SectionEOfficeUse = AssistiveDevice.SectionEOfficeUse || '';
                    if (SectionEOfficeUse.length > 0) {
                        var SectionEOfficeUseArr = SectionEOfficeUse.split(',');
                        $('#sectionE_RecevcedOn').val(SectionEOfficeUseArr[0])
                        $('#sectionE_AssessmentOn').val(SectionEOfficeUseArr[1])
                        $('#sectionE_Recommendation').val(SectionEOfficeUseArr[2])
                        $('#sectionE_ApprovedOn').val(SectionEOfficeUseArr[3])
                        $('#sectionE_ProcessedBy').val(SectionEOfficeUseArr[4])
                        $('#sectionE_Assessor').val(SectionEOfficeUseArr[5])
                        $('#sectionE_CommenceOn').val(SectionEOfficeUseArr[6])
                    }
                    $('#sectionE_CaseNote').val(AssistiveDevice.SectionECaseNote || '')

                }
            }
        }
    });
}

//Submit data
function Save() {

    if (!formSectionValidate($('#pageContentWrapper'), 1)) {
        return false;
    }
    var data = {};
    data['ID'] = CurrentID;
    $('#pageContentWrapper :input,select').each(function () {
        var type = $(this).attr('type'),
          name = $(this).attr('name'),
          val = $(this).val();
        if (type == "radio") {
            val = $(':input[type="' + type + '"][name="' + name + '"]:checked').val() || '';
        }
        if (type == "checkbox") {
            var tempVal = '';
            $(':input[type="' + type + '"][name="' + name + '"]:checked').each(function (index, item) {
                if ($(item).prop('checked') == true) {
                    tempVal += $(item).val() + ',';
                }
            });
            val = (tempVal.length > 0 ? tempVal.substr(0, tempVal.length - 1) : '');
        }
        if ((!data.hasOwnProperty(data[name])) && name) {
            data[name] = val;
        }
    });
    $.ajax({
        url: apiSrc + "BCMain/iCtc1.SaveAssistiveDeviceEquipmentSubsidy_Appln.json",
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
        success: function (data) {
            if ((data) && (data.d.RetVal === -1)) {
                alert('Successfully updated!');
                location.reload();
            } else {
                alert(data.d.RetMsg);
            }
        },
        error: function (XMLHttpRequest, data, errorThrown) {
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
        success: function (data) {
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
        success: function (data) {
            if ((data) && (data.d.RetVal === -1)) {
                if (data.d.RetData.Tbl.Rows.length > 0) {
                    var lookup = data.d.RetData.Tbl.Rows;
                    for (var i = 0; i < lookup.length; i++) {
                        $(sel).append('<option value="' + lookup[i].RelationshipAB + '">' + lookup[i].RelationshipAB + '</option>');
                    }
                }
            } else {
                alert(data.d.RetMsg);
            }
        }
    });
}


function formSectionsInit() {

    $('form.formSection').each(function () {
        var form = $(this);
        var fieldsets = form.find('fieldset');
        var breadcrumbs = form.find('.breadcrumbs');
        var footer = form.find('footer.buttonsGroup');

        form.data('current-form-index', 0);

        breadcrumbs.html('');

        fieldsets.each(function (index) {
            var fieldset = $(this);
            fieldset.data('fieldset-index', index);
            breadcrumbs.append('<li><a href="#' + fieldset.prop('id') + '" data-fieldset-index="' + index + '">' + fieldset.find('h2').html() + '</a>').find('li:eq(0) a').addClass('active');

            if (index > 0) {
                fieldset.hide();
            }
        });

        breadcrumbs.find('a').click(function () {
            var thisObj = $(this);
            var currentIndex = parseInt(form.data('current-form-index'));

            if (formSectionValidate(form, 0)) {
                loadFormSection(thisObj.data('fieldset-index'), 3);
            }
            return false;
        });

        //set buttons
        footer.find('#previous').hide();
        footer.find('[class*=submit]').hide();

        footer.find('#previous').unbind('click').click(function () {

            var currentIndex = parseInt(form.data('current-form-index'));
            var targetIndex = currentIndex - 1;

            if (targetIndex < 0) targetIndex = 0;

            if (formSectionValidate(form, 0)) {
                loadFormSection(targetIndex, 0);
            }
            return false;
        });
        footer.find('#next').unbind('click').click(function () {

            if (formSectionValidate(form, 0)) {
                var targetIndex = parseInt(form.data('current-form-index')) + 1;
                if (targetIndex >= fieldsets.length) targetIndex = fieldsets.length - 1;


                loadFormSection(targetIndex, 1);
            }
            return false;
        });

        function loadFormSection(index, isNext) {
            //set index
            if (index == 1) {
                if (moveToSectionC == 1 && isNext == 1) {
                    index++;
                }
                else if (moveToSectionC == 1 && isNext == 0) {
                    index--;
                }
            }
            form.data('current-form-index', index);
            var targetIndex = index;

            breadcrumbs.find('a').removeClass('active').filter(function () {
                return ($(this).data('fieldset-index') == targetIndex);
            }).addClass('active');

            //set fieldset`
            fieldsets.hide().filter(function () {
                return ($(this).data('fieldset-index') == targetIndex);
            }).show();

            if (index == 0) {
                footer.find('#previous').hide();
                footer.find('#next').show();
                footer.find('[class*=submit]').hide();
            }
            else if (index == fieldsets.length - 1) {
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

function formSectionValidate(form, isAll) {

    var result = 0;
    moveToSectionC = $('[name=sectionA_ordinaryMembership]:checked').val();
    if (!isAll) {
        $(form).find('fieldset:hidden :input,select').attr('disabled', 'disabled');
    }
    if (moveToSectionC == 1) {
        $(form).find('fieldset:eq(1) :input,select').attr('disabled', 'disabled');
    }
    $(form).on('formvalid.zf.abide', function () { result = 1; });

    $(form).foundation('validateForm');

    if (moveToSectionC == 1) {
        $(form).find('fieldset:not(:eq(1)) :input,select').removeAttr('disabled');
    }
    else {
        $(form).find('fieldset :input,select').removeAttr('disabled');
    }

    return result;
}
